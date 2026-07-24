"use server";

import { freeMealRecommendations, proTierLimit} from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import {request} from "@arcjet/next";
import OpenAI from "openai";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const UNSPLASH_ACCESS_KEY=process.env.UNSPLASH_ACCESS_KEY;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getRecipesByPantryIngredients() {

     let text = "";

    try {
        const user = await checkUser();
        if(!user) {
            throw new Error("User not Authenticated")
        }

console.log(user.subscriptiontier);

         const isPro = user.subscriptiontier === "pro";

        //apply Arcjet rate limit based on tier
        const arcjetClient = isPro ? proTierLimit : freeMealRecommendations;

        //create a request object for Arcjet

        const req = await request();

        const decision = await arcjetClient.protect(req, {
            userId: user.clerkId,
            requested: 1,
        });

        if(decision.isDenied()){
            if(decision.reason.isRateLimited()) {
                throw new Error(
                    `Monthly scan limit reached. ${
                        isPro
                        ? "Please contact support if you need more scans."
                        : "Upgrade to Pro for unlimited scans!"
                    } `
                )
            }
            throw new Error("Request denied by security system");
        }


        //get user's pantry items

        const pantryResponse = await fetch(
           `${STRAPI_URL}/api/pantry-items?filters[users_permissions_user][id][$eq]=${user.id}`,
           {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            cache: "no-store",
           }
        );

        if(!pantryResponse.ok) {
            throw new Error("Failed to fetch pantry items");
        }
        const pantryData = await pantryResponse.json();

        if(!pantryData.data || pantryData.data.length ===0){
            return{
                success:false,
                message: "Your pantry is empty. Add ingredients First!",
            };
        }

        const ingredients = pantryData.data.map((item) => item.name).join(",");

        

        const prompt = `You are a professional chef. Given these available ingredients: ${ingredients}

Suggest 5 recipes that can be made primarily with these ingredients. It's okay if the recipes need 1-2 common pantry staples (salt, pepper, oil, etc.) that aren't listed.

Return ONLY a valid JSON object with this format:

{
 "recipes":[
   {
     "title":"Recipe name"
   }
 ]
}(no markdown, no explanations):
[
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

Rules:
- matchPercentage should be 70-100% (how many listed ingredients are used)
- missingIngredients should be common items or optional additions
- Sort by matchPercentage descending
- Make recipes realistic and delicious
`;


const completion = await client.chat.completions.create({
  model: "gpt-4.1-mini",
  messages:[
    {
      role:"user",
      content:prompt,
    }
  ],
  response_format:{
    type:"json_object"
  }
});

const content = completion.choices[0].message.content;
console.log(completion);
console.log("Content:");
console.log(content);

text =
  typeof content === "string"
    ? content
    : content.map((part) => part.text || "").join("");

console.log("========== AI RESPONSE ==========");
console.log(text);
console.log("================================");




let recipeSuggestions;

try{

const cleanText = text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

console.log("CLEAN TEXT:");
console.log(cleanText);

recipeSuggestions = JSON.parse(cleanText).recipes;
}catch(parseError){
    console.error("FAILED JSON PARSE");
    console.error("RAW RESPONSE:", text);
    console.error("PARSE ERROR:", parseError.message);

    throw new Error(
        "Failed to generate recipe suggestions. Please try again."
    );
}

    return {
        success: true,
        recipes: recipeSuggestions,
        ingredientsUsed: ingredients,
        recommendationsLimit: isPro ? "unlimited":5,
        message:`Found ${recipeSuggestions.length} recipes you can make!`,
    };

    } catch(error) {
    console.error("========== ERROR ==========");
    console.error(error);
    console.log("Raw AI Response:");
    console.log(text);
    console.error("===========================");

    throw error;
}
}

//Helper function to noramlize recipe title
function normalizedTitle(title){
    return title
    .trim()
    .split(" ")
    .map((word)=> word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

}

//helper function to fetch image from unsplash
async function fetchRecipeImage(recipeName){
    try{
        if(!UNSPLASH_ACCESS_KEY){
            console.warn("UNSPLASH_ACCESS_KEY not set, skipping image fetch");
            return"";
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

        if(!response.ok) {
            console.error("Unsplash API error:", response.statusText);
            return"";
        }
        const data = await response.json();

        if(data.results && data.results.length > 0){
            const photo = data.results[0];
            return photo.urls.regular;
        }

        return"";

    }catch(error){
        console.error("Error fetching Unsplash image:", error);
        return"";
    }
}

// get or generate recipe details
export async function getOrGenerateRecipe(formData){
    try{
        const user = await checkUser();
        if(!user){
            throw new Error("User not authenticated");
        }

        const recipeName = formData.get("recipeName");
        if(!recipeName){
            throw new Error("Recipe Name is required")
        }

        const isPro = user.subscriptiontier === "pro";

        //Normalize the title (e.g.,"apple cake", "Apple Cake")
        const recipeTitle = normalizedTitle(recipeName);

        // Step 1 : Check if recipe alrady exist in db
        const searchResponse = await fetch(
            `${STRAPI_URL}/api/recipes?filters[title][$eqi]=${encodeURIComponent(
                recipeTitle
            )}&populate=*`,
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                cache: "no-store",
            }
        );

        if(searchResponse.ok){
            const searchData = await searchResponse.json();

            if(searchData.data && searchData.data.length > 0){
                //Check if user has saved this recipe
                const savedRecipeResponse = await fetch(
                     `${STRAPI_URL}/api/saved-recipes?filters[users_permissions_user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${searchData.data[0].id}`,
                    {
                        headers:{
                            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                        },
                        cache: "no-store",
                    }
                );

                let isSaved = false;
                if(savedRecipeResponse.ok){
                    const savedData = await savedRecipeResponse.json();
                    isSaved = savedData.data && savedData.data.length > 0;
                }

                return{
                    success: true,
                    recipe: searchData.data[0],
                    recipeId: searchData.data[0].id,
                    isSaved: isSaved,
                    fromDatabase: true,
                    message: "Recipe loaded from database",
                };
            }
        }

        //Step 2: recipe doesnt exit , generate with gemini

         const prompt = `
You are a professional chef and recipe expert. Generate a detailed recipe for: "${recipeTitle}"

CRITICAL: The "title" field MUST be EXACTLY: "${recipeTitle}" (no changes, no additions like "Classic" or "Easy")

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "title": "${recipeTitle}",
  "description": "Brief 2-3 sentence description of the dish",
  "category": "Must be ONE of these EXACT values: breakfast, lunch, dinner, snack, dessert",
  "cuisine": "Must be ONE of these EXACT values: italian, chinese, mexican, indian, american, thai, japanese, mediterranean, french, korean, vietnamese, spanish, greek, turkish, moroccan, brazilian, caribbean, middle-eastern, british, german, portuguese, other",
  "prepTime": "Time in minutes (number only)",
  "cookTime": "Time in minutes (number only)",
  "servings": "Number of servings (number only)",
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
    "calories": "calories per serving",
    "protein": "grams",
    "carbs": "grams",
    "fat": "grams"
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
- Keep total instructions under 12 steps
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

    const content = completion.choices[0].message.content;

    const text =
    typeof content === "string"
    ? content
    : content.map((part) => part.text || "").join("");
        

        //Parse JSON response
        let recipeData;
        try{
            const cleanText = text
            .replace(/```json\n?/g,"")
            .replace(/```\n?/g,"")
            .trim();
        recipeData = JSON.parse(cleanText);
        }catch(parseError){
            console.error("RAW AI RESPONSE:", text);
            console.error("PARSE ERROR:", parseError.message);
            throw new Error("Failed to generate recipe. Please try again.");
        }

        //FORCE the title to be our normalized version
        recipeData.title = recipeTitle;

        const category = recipeData.category.toLowerCase();

        let cuisine = recipeData.cuisine.trim().toLowerCase();

        if (cuisine === "middle-eastern" || cuisine === "middle eastern") {
            cuisine = "Middle Eastern";
        } else {
            cuisine =
        cuisine.charAt(0).toUpperCase() +
        cuisine.slice(1);
        }

        //Step 3: Fetch image from unsplash
        const imageUrl = await fetchRecipeImage(recipeTitle);

        //Step 4 : Save genrated recipe to db;

        const strapiRecipeData = {
    data: {
        title: recipeTitle,
        description: recipeData.description,
        cuisine,
        category,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,

        prepTime: Number(recipeData.prepTime),
        cookTime: Number(recipeData.cookTime),

        serving: Number(recipeData.servings),

        nutritions: recipeData.nutrition,

        tips: recipeData.tips,

        substitution: recipeData.substitutions,

        imageUrl: imageUrl || "",

        isPublic: true,

        users_permissions_user: user.id,
    },
};

        const createRecipeResponse = await fetch(`${STRAPI_URL}/api/recipes`,{
            method:"POST",
            headers: {
                "Content-type":"application/json",
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            body: JSON.stringify(strapiRecipeData),
        });
       if (!createRecipeResponse.ok) {
    const errorText = await createRecipeResponse.text();

    console.log("========== STRAPI ERROR ==========");
    console.log(errorText);
    console.log("========== DATA SENT ==========");
    console.dir(strapiRecipeData, { depth: null });
    console.log("================================");

    throw new Error(errorText);
}


        const createdRecipe = await createRecipeResponse.json();

        console.log("========== CREATED RECIPE ==========");
        console.log(JSON.stringify(createdRecipe, null, 2));
        console.log("====================================");

        return {
            success:true,
            recipe: {
                ...recipeData,
                title: recipeTitle,
                category,
                cuisine,
                imageUrl: imageUrl || "",
            },
            recipeId: createdRecipe.data.id,
            isSaved: false,
            fromDatabase: false,
            recommendationsLimit: isPro ? "unlimited" : 5,
            message: "Recipe generated and saved successfully!",
        };

    }catch(error){
        console.error("Error in getOrGenerateRecipe:", error);
        throw new Error(error.message || "Failed to load recipe")
    }
}

//Save recipe to user's collection
export async function saveRecipeToCollection(formData){
    try{
        const user = await checkUser();

        if (!user){
            throw new Error("User not authenticated");
        }
        const recipeId = formData.get("recipeId");
        if(!recipeId){
            throw new Error("Recipe ID is required");
        }

        // check if already saved
        const existingResponse = await fetch(
            `${STRAPI_URL}/api/saved-recipes?filters[users_permissions_user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${recipeId}`,
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`
                },
                cache: "no-store",
            }
        );

        if(existingResponse.ok){
            const existingData = await existingResponse.json();
            if(existingData.data && existingData.data.length > 0) {
                return {
                    success:true,
                    alreadySaved: true,
                    message: "Recipe is already in your collection",
                }
            }
        }
        // Create saved your relation
        const savedResponse = await fetch(`${STRAPI_URL}/api/saved-recipes`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            body: JSON.stringify({
                data: {
                    users_permissions_user: user.id,
                    recipe: recipeId,
                    savedAt: new Date().toISOString(), 
                },
            }),
        });

        console.log("Status:", savedResponse.status);

        if (!savedResponse.ok) {
        const errorText = await savedResponse.text();
        console.log("Response:", errorText);
        throw new Error(errorText);
        }

    const savedRecipe = await savedResponse.json();

    console.log("Response:", savedRecipe);

        return {
            success:true,
            alreadySaved: false,
            savedRecipe: savedRecipe.data,
            message: "Recipe saved to your collection!",
        }
    }catch(error){
        console.error("Error saving recipe to collection:", error);
        throw new Error(error.message || "Failed to save recipe");
    }
}

//Remove recipe to user's collection
export async function removeRecipeFromCollection(formData){
    try{
        const user = await checkUser();
        if(!user){
            throw new Error("User not authenticated");
        }

        const recipeId = formData.get("recipeId");
        if(!recipeId) {
            throw new Error("Recipe ID is required");
        }

        //find saved recipe platform
        const searchResponse = await fetch(
            `${STRAPI_URL}/api/saved-recipes?filters[users_permissions_user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${recipeId}`,
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                cache: "no-store",
            }
        );

        if(!searchResponse.ok){
            throw new Error("Failed to find saved recipe");
        }

        const searchData = await searchResponse.json();

        if(!searchData.data || searchData.data.length === 0){
            return{
                success:true,
                message: "Recipe was not in your collection",
            };
        }

        //Delete saved recipe relation
        const savedRecipeId = searchData.data[0].id;
        const deleteResponse = await fetch(
            `${STRAPI_URL}/api/saved-recipes/${savedRecipeId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
            }
        );

        if(!deleteResponse.ok){
            throw new Error("Failed to remove recipe from collection");
        }
        return {
            success: true,
            message:"Recipe removed from your collection"
        };
    } catch(error){
        console.error("Error removing recipe from collection:", error);
        throw new Error(error.message || "Failed to remove recipe");
    }
}

//Get user's saved recipes
export async function getSavedRecipes() {
  try {
    const user = await checkUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const url =
  `${STRAPI_URL}/api/saved-recipes` +
  `?filters[users_permissions_user][documentId][$eq]=${user.documentId}` +
  `&populate[recipe]=true` +
  `&sort=savedAt:desc`;

console.log(url);

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  },
  cache: "no-store",
});

    console.log("Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Response:", errorText);
      throw new Error("Failed to fetch saved recipes");
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

    return {
      success: true,
      recipes: data.data,
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