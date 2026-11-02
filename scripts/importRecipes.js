require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const recipes = require("./recipes-fixed.json");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai-recipe-platform";

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    category: { type: String, default: "other" },
    cuisine: { type: String, default: "other" },
    prepTime: { type: Number, default: 0 },
    cookTime: { type: Number, default: 0 },
    serving: { type: Number, default: 1 },
    ingredients: { type: mongoose.Schema.Types.Mixed, default: [] },
    instructions: { type: mongoose.Schema.Types.Mixed, default: [] },
    nutritions: { type: mongoose.Schema.Types.Mixed, default: {} },
    tips: { type: mongoose.Schema.Types.Mixed, default: [] },
    substitution: { type: mongoose.Schema.Types.Mixed, default: [] },
    imageUrl: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    userId: { type: String, default: "system" },
  },
  { timestamps: true }
);

const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const formattedRecipes = recipes.map((recipe) => ({
    title: recipe.recipe_title,
    description: recipe.description || "",
    category: (recipe.category || "other").toLowerCase(),
    cuisine: "International",
    prepTime: 0,
    cookTime: 0,
    serving: 1,
    ingredients: recipe.ingredients || [],
    instructions: recipe.directions || [],
    nutritions: {},
    tips: [],
    substitution: [],
    imageUrl: "",
    isPublic: true,
    userId: "system",
  }));

  for (const item of formattedRecipes) {
    await Recipe.updateOne(
      { title: item.title },
      { $setOnInsert: item },
      { upsert: true }
    );
  }

  console.log("Recipes imported successfully into MongoDB");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });