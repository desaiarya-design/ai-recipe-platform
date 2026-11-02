"use server";

import { proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import OpenAI from "openai";
import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import SavedRecipe from "@/models/SavedRecipe";
import PantryItem from "@/models/PantryItem";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getRecipesByPantryIngredients() {
  let text = "";

  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not Authenticated");
    }

    // Apply Arcjet rate limit protection
    const req = await request();
    const decision = await proTierLimit.protect(req, {
      userId: user.clerkId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimited()) {
        throw new Error("Scan limit reached. Please try again later.");
      }
      throw new Error("Request denied by security system");
    }

    await connectDB();

    // Get user's pantry items
    const pantryItems = await PantryItem.find({
      userId: user.id,
    }).select("name");

    if (pantryItems.length === 0) {
      return {
        success: false,
        message: "Your pantry is empty. Add ingredients first!",
      };
    }

    const ingredients = pantryItems.map((item) => item.name).join(", ");

    const prompt = `You are a professional chef. Given these available ingredients: ${ingredients}

Suggest 5 recipes that can be made primarily with these ingredients. It's okay if the recipes need 1-2 common pantry staples (salt, pepper, oil, etc.) that aren't listed.

Return ONLY a valid JSON object with this format:

{
 "recipes":[
   {
     "title": "Recipe name",
     "description": "Brief 1-2 sentence description",
     "matchPercentage": 85,
     "missingIngredients": ["ingredient1", "ingredient2"],
     "category": "breakfast|lunch|dinner|snack|dessert",
     "cuisine": "italian|chinese|mexican|etc",
     "prepTime": 20,
     "cookTime": 30,
     "servings": 4
   }
 ]
}

Rules:
- matchPercentage should be 70-100% (how many listed ingredients are used)
- missingIngredients should be common items or optional additions
- Sort by matchPercentage descending
- Make recipes realistic and delicious
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const content = completion.choices[0]?.message?.content;
    text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
        ? content.map((part) => part.text || "").join("")
        : "";

    let recipeSuggestions;
    try {
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanText);
      recipeSuggestions = parsed.recipes || [];
    } catch (parseError) {
      console.error("FAILED JSON PARSE:", parseError.message);
      throw new Error(
        "Failed to generate recipe suggestions. Please try again."
      );
    }

    return {
      success: true,
      recipes: recipeSuggestions,
      ingredientsUsed: ingredients,
      recommendationsLimit: "unlimited",
      message: `Found ${recipeSuggestions.length} recipes you can make!`,
    };
  } catch (error) {
    console.error("Error in getRecipesByPantryIngredients:", error);
    throw error;
  }
}

// Helper function to normalize recipe title
function normalizedTitle(title) {
  return title
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Helper function to fetch image from unsplash
async function fetchRecipeImage(recipeName) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn("UNSPLASH_ACCESS_KEY not set, skipping image fetch");
      return "";
    }

    const searchQuery = `${recipeName}`;
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchQuery
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Unsplash API error:", response.statusText);
      return "";
    }
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    return "";
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
    return "";
  }
}

// Get or generate recipe details
export async function getOrGenerateRecipe(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const recipeName = String(formData.get("recipeName") || "").trim();
    if (!recipeName) {
      throw new Error("Recipe Name is required");
    }

    await connectDB();

    const recipeTitle = normalizedTitle(recipeName);

    // Step 1: Check if recipe already exists in MongoDB
    const existingRecipe = await Recipe.findOne({
      title: { $regex: new RegExp(`^${recipeTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
    });

    if (existingRecipe) {
      const savedRecipe = await SavedRecipe.findOne({
        userId: user.id,
        recipeId: existingRecipe._id,
      });

      const formatted = existingRecipe.toObject();

      return {
        success: true,
        recipe: {
          ...formatted,
          id: existingRecipe._id.toString(),
          _id: existingRecipe._id.toString(),
          nutrition: formatted.nutritions || formatted.nutrition,
          substitutions: formatted.substitution || formatted.substitutions,
          tips: formatted.tips || [],
        },
        recipeId: existingRecipe._id.toString(),
        isSaved: !!savedRecipe,
        fromDatabase: true,
        isPro: true,
        recommendationsLimit: "unlimited",
        message: "Recipe loaded from database",
      };
    }

    // Step 2: Recipe does not exist, generate with OpenAI
    const prompt = `
You are a professional chef and recipe expert. Generate a detailed recipe for: "${recipeTitle}"

CRITICAL: The "title" field MUST be EXACTLY: "${recipeTitle}" (no changes, no additions like "Classic" or "Easy")

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "title": "${recipeTitle}",
  "description": "Brief 2-3 sentence description of the dish",
  "category": "Must be ONE of these EXACT values: breakfast, lunch, dinner, snack, dessert",
  "cuisine": "Must be ONE of these EXACT values: italian, chinese, mexican, indian, american, thai, japanese, mediterranean, french, korean, vietnamese, spanish, greek, turkish, moroccan, brazilian, caribbean, middle-eastern, british, german, portuguese, other",
  "prepTime": 20,
  "cookTime": 30,
  "servings": 4,
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "quantity with unit",
      "category": "Protein|Vegetable|Spice|Dairy|Grain|Other"
    }
  ],
  "instructions": [
    {
      "step": "1",
      "title": "Brief step title",
      "instruction": "Detailed step instruction",
      "tip": "Optional cooking tip for this step"
    }
  ],
  "nutrition": {
    "calories": "350 kcal",
    "protein": "25g",
    "carbs": "40g",
    "fat": "12g"
  },
  "tips": [
    "General cooking tip 1",
    "General cooking tip 2",
    "General cooking tip 3"
  ],
  "substitutions": [
    {
      "original": "ingredient name",
      "alternatives": ["substitute 1", "substitute 2"]
    }
  ]
}

IMPORTANT RULES FOR CATEGORY:
- Breakfast items (pancakes, eggs, cereal, etc.) → "breakfast"
- Main meals for midday (sandwiches, salads, pasta, etc.) → "lunch"
- Main meals for evening (heavier dishes, roasts, etc.) → "dinner"
- Light items between meals (chips, crackers, fruit, etc.) → "snack"
- Sweet treats (cakes, cookies, ice cream, etc.) → "dessert"

IMPORTANT RULES FOR CUISINE:
- Use lowercase only
- Pick the closest match from the allowed values
- If uncertain, use "other"

Guidelines:
- Make ingredients realistic and commonly available
- Instructions should be clear and beginner-friendly
- Include 6-10 detailed steps
- Provide practical cooking tips
- Estimate realistic cooking times
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
        ? content.map((part) => part.text || "").join("")
        : "";

    let recipeData;
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      recipeData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("RAW AI RESPONSE:", text);
      throw new Error("Failed to generate recipe. Please try again.");
    }

    recipeData.title = recipeTitle;
    const category = (recipeData.category || "other").toLowerCase();

    let cuisine = (recipeData.cuisine || "other").trim().toLowerCase();
    if (cuisine === "middle-eastern" || cuisine === "middle eastern") {
      cuisine = "Middle Eastern";
    } else {
      cuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
    }

    // Step 3: Fetch image from unsplash
    const imageUrl = await fetchRecipeImage(recipeTitle);

    // Step 4: Save generated recipe to MongoDB
    const createdRecipe = await Recipe.create({
      title: recipeTitle,
      description: recipeData.description || "",
      category,
      cuisine,
      prepTime: Number(recipeData.prepTime) || 0,
      cookTime: Number(recipeData.cookTime) || 0,
      serving: Number(recipeData.servings) || 1,
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      nutritions: recipeData.nutrition || {},
      tips: recipeData.tips || [],
      substitution: recipeData.substitutions || [],
      imageUrl: imageUrl || "",
      isPublic: true,
      userId: user.id,
    });

    return {
      success: true,
      recipe: {
        ...recipeData,
        id: createdRecipe._id.toString(),
        _id: createdRecipe._id.toString(),
        title: recipeTitle,
        category,
        cuisine,
        imageUrl: imageUrl || "",
        nutrition: recipeData.nutrition,
        substitutions: recipeData.substitutions,
        tips: recipeData.tips || [],
      },
      recipeId: createdRecipe._id.toString(),
      isSaved: false,
      fromDatabase: false,
      isPro: true,
      recommendationsLimit: "unlimited",
      message: "Recipe generated and saved successfully!",
    };
  } catch (error) {
    console.error("Error in getOrGenerateRecipe:", error);
    throw new Error(error.message || "Failed to load recipe");
  }
}

// Save recipe to user's collection
export async function saveRecipeToCollection(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const recipeId = String(formData.get("recipeId") || "");
    if (!recipeId) {
      throw new Error("Recipe ID is required");
    }

    await connectDB();

    const existingRecipe = await SavedRecipe.findOne({
      userId: user.id,
      recipeId,
    });

    if (existingRecipe) {
      return {
        success: true,
        alreadySaved: true,
        message: "Recipe is already in your collection",
      };
    }

    const savedRecipe = await SavedRecipe.create({
      userId: user.id,
      recipeId,
      savedAt: new Date(),
    });

    return {
      success: true,
      alreadySaved: false,
      savedRecipe: {
        id: savedRecipe._id.toString(),
        _id: savedRecipe._id.toString(),
        userId: String(savedRecipe.userId),
        recipeId: savedRecipe.recipeId ? savedRecipe.recipeId.toString() : String(recipeId),
      },
      message: "Recipe saved to your collection!",
    };
  } catch (error) {
    console.error("Error saving recipe to collection:", error);
    throw new Error(error.message || "Failed to save recipe");
  }
}

// Remove recipe from user's collection
export async function removeRecipeFromCollection(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const recipeId = String(formData.get("recipeId") || "");
    if (!recipeId) {
      throw new Error("Recipe ID is required");
    }

    await connectDB();

    const savedRecipe = await SavedRecipe.findOne({
      userId: user.id,
      recipeId,
    });

    if (!savedRecipe) {
      return {
        success: true,
        message: "Recipe was not in your collection",
      };
    }

    await SavedRecipe.deleteOne({
      _id: savedRecipe._id,
    });

    return {
      success: true,
      message: "Recipe removed from your collection",
    };
  } catch (error) {
    console.error("Error removing recipe from collection:", error);
    throw new Error(error.message || "Failed to remove recipe");
  }
}

// Get user's saved recipes
export async function getSavedRecipes() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    const savedDocs = await SavedRecipe.find({
      userId: user.id,
    })
      .populate("recipeId")
      .sort({ savedAt: -1 });

    const recipes = savedDocs
      .map((doc) => {
        const recipeData = doc.recipeId || doc.recipe;
        if (!recipeData || typeof recipeData !== "object" || !recipeData.title) {
          return null;
        }
        const recipeObj =
          typeof recipeData.toObject === "function"
            ? recipeData.toObject()
            : recipeData;

        return {
          id: doc._id.toString(),
          _id: doc._id.toString(),
          savedAt: doc.savedAt,
          recipe: {
            ...recipeObj,
            id: recipeObj._id ? recipeObj._id.toString() : doc.recipeId.toString(),
            _id: recipeObj._id ? recipeObj._id.toString() : doc.recipeId.toString(),
            nutrition: recipeObj.nutritions || recipeObj.nutrition,
            substitutions: recipeObj.substitution || recipeObj.substitutions,
            tips: recipeObj.tips || [],
          },
        };
      })
      .filter(Boolean);


    return {
      success: true,
      recipes,
      message: "Saved recipes loaded successfully",
    };
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    return {
      success: false,
      recipes: [],
      message: error.message || "Failed to fetch saved recipes",
    };
  }
}