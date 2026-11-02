import mongoose from "mongoose";

const PantryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    userId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PantryItem || mongoose.model("PantryItem", PantryItemSchema);
