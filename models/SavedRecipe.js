import mongoose from "mongoose";

const SavedRecipeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
    savedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SavedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

SavedRecipeSchema.virtual("recipe", {
  ref: "Recipe",
  localField: "recipeId",
  foreignField: "_id",
  justOne: true,
});

export default mongoose.models.SavedRecipe || mongoose.model("SavedRecipe", SavedRecipeSchema);

