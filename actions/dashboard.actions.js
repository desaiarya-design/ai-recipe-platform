"use server";

import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { getRecipeOfTheDay as getMealDBRecipeOfTheDay } from "@/actions/mealdb.actions";

export async function getRecipesByCuisine(cuisine) {
  try {
    await connectDB();
    const formattedCuisine = cuisine
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const recipes = await Recipe.find({
      cuisine: formattedCuisine,
      isPublic: true,
    }).sort({ createdAt: -1 });

    return {
      success: true,
      recipe: recipes.map((r) => ({
        ...r.toObject(),
        id: r._id.toString(),
        _id: r._id.toString(),
      })),
    };
  } catch (error) {
    console.error("Error in getRecipesByCuisine:", error);
    return {
      success: false,
      recipe: [],
    };
  }
}

export async function getRecipesByCategory(category) {
  try {
    await connectDB();
    const recipes = await Recipe.find({
      category: category.toLowerCase(),
      isPublic: true,
    }).sort({ createdAt: -1 });

    return {
      success: true,
      recipe: recipes.map((r) => ({
        ...r.toObject(),
        id: r._id.toString(),
        _id: r._id.toString(),
      })),
    };
  } catch (error) {
    console.error("Error in getRecipesByCategory:", error);
    return {
      success: false,
      recipe: [],
    };
  }
}

function normalizeRecipe(raw) {
  if (!raw) return null;
  return {
    ...raw,
    id: raw._id ? raw._id.toString() : raw.id || raw.idMeal || "",
    _id: raw._id ? raw._id.toString() : raw.id || raw.idMeal || "",
    title: raw.title || raw.strMeal || "Recipe of the Day",
    imageUrl: raw.imageUrl || raw.strMealThumb || "/placeholder.png",
    category: raw.category || raw.strCategory || "General",
    cuisine: raw.cuisine || raw.strArea || "International",
    description: raw.description || raw.strInstructions || "",
    strMeal: raw.strMeal || raw.title || "Recipe of the Day",
    strMealThumb: raw.strMealThumb || raw.imageUrl || "/placeholder.png",
    strCategory: raw.strCategory || raw.category || "General",
    strArea: raw.strArea || raw.cuisine || "International",
    strInstructions: raw.strInstructions || raw.description || "",
  };
}

export async function getRecipeOfTheDay() {
  try {
    await connectDB();
    const count = await Recipe.countDocuments({ isPublic: true });

    if (count > 0) {
      const random = Math.floor(Math.random() * count);
      const recipe = await Recipe.findOne({ isPublic: true }).skip(random);
      if (recipe) {
        return {
          success: true,
          recipe: normalizeRecipe(recipe.toObject()),
        };
      }
    }
  } catch (error) {
    console.warn("MongoDB getRecipeOfTheDay falling back to MealDB:", error.message);
  }

  try {
    const mealDBRes = await getMealDBRecipeOfTheDay();
    return {
      success: true,
      recipe: normalizeRecipe(mealDBRes?.recipe),
    };
  } catch (fallbackError) {
    console.error("MealDB fallback failed:", fallbackError);
    return {
      success: false,
      recipe: null,
    };
  }
}