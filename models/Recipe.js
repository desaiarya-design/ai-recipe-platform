import mongoose from "mongoose";

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
    userId: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);
