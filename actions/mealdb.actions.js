"use server";

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

export async function getRecipeOfTheDay() {
  try {
    const response = await fetch(`${MEALDB_BASE}/random.php`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recipe of the day");
    }

    const data = await response.json();
    return {
      success: true,
      recipe: data.meals[0],
    };
  } catch (error) {
    console.error("Error fetching recipe of the day:", error);
    throw new Error(error.message || "Failed to load recipe");
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${MEALDB_BASE}/list.php?c=list`, {
      next: { revalidate: 604800 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Categories");
    }

    const data = await response.json();
    return {
      success: true,
      recipe: data.meals || [],
    };
  } catch (error) {
    console.error("Error fetching Categories:", error);
    throw new Error(error.message || "Failed to load Categories");
  }
}

export async function getArea() {
  try {
    const response = await fetch(`${MEALDB_BASE}/list.php?a=list`, {
      next: { revalidate: 604800 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch areas");
    }

    const data = await response.json();
    return {
      success: true,
      recipe: data.meals || [],
    };
  } catch (error) {
    console.error("Error fetching area:", error);
    throw new Error(error.message || "Failed to load area");
  }
}

export async function getMealsByCategory(category) {
  try {
    const response = await fetch(
      `${MEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`,
      {
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    const data = await response.json();
    return {
      success: true,
      recipe: data.meals || [],
      category,
    };
  } catch (error) {
    console.error("Error fetching meals by category:", error);
    throw new Error(error.message || "Failed to load meals");
  }
}

export async function getMealsByArea(area) {
  try {
    const formattedArea = area
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const url = `${MEALDB_BASE}/filter.php?a=${encodeURIComponent(formattedArea)}`;
    const response = await fetch(url);
    const data = await response.json();

    return {
      success: true,
      recipe: data.meals || [],
      area: formattedArea,
    };
  } catch (error) {
    console.error("Error fetching meals by area:", error);
    throw new Error(error.message || "Failed to load meals");
  }
}