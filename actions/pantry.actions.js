"use server";

import { proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import OpenAI from "openai";
import { connectDB } from "@/lib/mongodb";
import PantryItem from "@/models/PantryItem";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function scanPantryImage(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Apply Arcjet protection
    const req = await request();
    const decision = await proTierLimit.protect(req, {
      userId: user.clerkId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimited()) {
        throw new Error("Scan rate limit reached. Please try again later.");
      }
      throw new Error("Request denied by security system");
    }

    const imageFile = formData.get("image");
    if (!imageFile) {
      throw new Error("No image provided");
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const prompt = `You are a professional chef and ingredient recognition expert. Analyze this image of a pantry/fridge and identify all visible food ingredients.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanations):
[
  {
    "name": "ingredient name",
    "quantity": "estimated quantity with unit",
    "confidence": 0.95
  }
]

Rules:
- Only identify food ingredients (not containers, utensils, or packaging)
- Be specific (e.g., "Cheddar Cheese" not just "Cheese")
- Estimate realistic quantities (e.g., "3 eggs", "1 cup milk", "2 tomatoes")
- Confidence should be 0.7-1.0 (omit items below 0.7)
- Maximum 20 items
- Common pantry staples are acceptable (salt, pepper, oil)
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageFile.type};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    let text = "";

    if (typeof content === "string") {
      text = content;
    } else if (Array.isArray(content)) {
      text = content.map((part) => part.text || "").join("");
    } else {
      throw new Error("No response received from the AI model.");
    }

    let ingredients;
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      ingredients = JSON.parse(cleanText);
    } catch (error) {
      console.error("Failed to parse AI response:", text);
      throw new Error("Failed to parse ingredients. Please try again.");
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error(
        "No ingredients detected in the image. Please try a clearer photo."
      );
    }

    return {
      success: true,
      ingredients: ingredients.slice(0, 20),
      scanslimit: "unlimited",
      message: `Found ${ingredients.length} ingredients!`,
    };
  } catch (error) {
    console.error("FULL ERROR in scanPantryImage:", error);
    throw error;
  }
}

export async function saveToPantry(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const ingredientsJson = formData.get("ingredients");
    const ingredients = JSON.parse(ingredientsJson);

    if (!ingredients || ingredients.length === 0) {
      throw new Error("No ingredients to save");
    }

    await connectDB();

    const savedItems = [];
    for (const ingredient of ingredients) {
      const item = await PantryItem.create({
        name: ingredient.name,
        quantity: ingredient.quantity || "",
        imageUrl: "",
        userId: user.id,
      });

      savedItems.push({
        id: item._id.toString(),
        _id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
      });
    }

    return {
      success: true,
      savedItems,
      message: `Saved ${savedItems.length} items to your pantry!`,
    };
  } catch (error) {
    console.error("Error in saveToPantry:", error);
    throw new Error(error.message || "Failed to save items");
  }
}

export async function addPantryItemManually(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const name = String(formData.get("name") || "").trim();
    const quantity = String(formData.get("quantity") || "").trim();

    if (!name || !quantity) {
      throw new Error("Name and quantity are required");
    }

    await connectDB();

    const item = await PantryItem.create({
      name,
      quantity,
      imageUrl: "",
      userId: user.id,
    });

    return {
      success: true,
      item: {
        id: item._id.toString(),
        _id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
      },
      message: "Item added successfully!",
    };
  } catch (error) {
    console.error("Error in addPantryItemManually:", error);
    throw new Error(error.message || "Failed to add item");
  }
}

export async function getPantryItems() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    const items = await PantryItem.find({
      userId: user.id,
    }).sort({ createdAt: -1 });

    return {
      success: true,
      items: items.map((item) => ({
        id: item._id.toString(),
        _id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        createdAt: item.createdAt,
      })),
      scanslimit: "unlimited",
    };
  } catch (error) {
    console.error("Error in getPantryItems:", error);
    throw new Error(error.message || "Failed to load pantry");
  }
}

export async function deletePantryItem(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const id = String(formData.get("id") || "");
    if (!id) {
      throw new Error("Item id is required");
    }

    await connectDB();

    const item = await PantryItem.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!item) {
      throw new Error("Item not found or unauthorized");
    }

    return {
      success: true,
      message: "Item removed from pantry",
    };
  } catch (error) {
    console.error("Error in deletePantryItem:", error);
    throw new Error(error.message || "Failed to delete item");
  }
}

export async function updatePantryItem(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const quantity = String(formData.get("quantity") || "").trim();

    if (!id || !name || !quantity) {
      throw new Error("Id, name and quantity are required");
    }

    await connectDB();

    const item = await PantryItem.findOneAndUpdate(
      {
        _id: id,
        userId: user.id,
      },
      {
        name,
        quantity,
      },
      { new: true }
    );

    if (!item) {
      throw new Error("Item not found or unauthorized");
    }

    return {
      success: true,
      item: {
        id: item._id.toString(),
        _id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
      },
      message: "Item updated successfully!",
    };
  } catch (error) {
    console.error("Error in updatePantryItem:", error);
    throw new Error(error.message || "Failed to update item");
  }
}