"use server";
import { freePantryScans, proTierLimit} from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import {request} from "@arcjet/next";
import OpenAI from "openai";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI key exists:", !!process.env.OPENAI_API_KEY);

export async function scanPantryImage(formData) {

    console.log("STEP 1: scanPantryImage called");

    try {
        const user = await checkUser();
        console.log("STEP 2: User checked");

        if(!user) {
            throw new Error("User not authenticated");
        }

        const isPro = user.subscriptiontier === "pro";

        //apply Arcjet rate limit based on tier
        const arcjetClient = isPro ? proTierLimit : freePantryScans;

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

        const imageFile = formData.get("image");
        console.log("STEP 3: Image:", imageFile);

        if(!imageFile){
            throw new Error("No image provided"); 
        }

        //convert image to base64

        const bytes = await imageFile.arrayBuffer();
        console.log("STEP 4: Converted image");

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

const content = completion.choices[0].message.content;

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
                .replace(/```json\n?/g,"")
                .replace(/```\n?/g,"")
                .trim(); 
            ingredients = JSON.parse(cleanText);
        } catch(error) {
            console.error("Failed to parse AI response:", text);
            throw new Error("Failed to parse ingredients. Please try again.")
        }

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            throw new Error(
                "No ingredients detected in the image. Please try a clearer photo."
            );
        }

        return {
            success: true,
            ingredients: ingredients.slice(0, 20),
            scanslimit: isPro ? "unlimited" : 10,
            message : `Found ${ingredients.length} ingredients!`,
        };

    } catch (error) {
    console.error("FULL ERROR:", error);

    if (error.response) {
        console.error("Response:", error.response);
    }

    throw error;
}
}

export async function saveToPantry(formData){
    try{
        const user = await checkUser();
        console.log("User returned from checkUser:", user);
        if(!user){
            throw new Error("User not authenticated");
        }

        const ingredientsJson = formData.get("ingredients");
        const ingredients = JSON.parse(ingredientsJson);

        if(!ingredients || ingredients.length === 0){
            throw new Error("No ingredients to save");
        }

        const savedItems = [];
        for (const ingredient of ingredients) {
            const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({
                    data: {
                        name: ingredient.name,
                        quantity: ingredient.quantity,
                        imageUrl: " ",
                        users_permissions_user: user.id,
                    }
                })
            });
            if(response.ok){
                const data = await response.json();
                savedItems.push(data.data);
            }
        }

        return {
            success: true,
            savedItems,
            message: `Saved ${savedItems.length} items to your pantry!`,
        };
    }catch(error){
        console.error("Error saving to Pantry:", error);
        throw new Error(error.message || "Failed to save items");
    }
}
export async function addPantryItemManually(formData){

    try {
        const user = await checkUser();
        if(!user) {
            throw new Error("user not authenticated");
        }

        const name = formData.get("name");
        const quantity = formData.get("quantity");

        if(!name || !quantity){
            throw new Error("Name and quantity are required");
        }

         const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({
                    data: {
                        name,
                        quantity,
                        imageUrl: "",
                        users_permissions_user: user.id,
                    }
                })
            });

             if (!response.ok) {
                throw new Error("Failed to add item");
                }

            const data = await response.json();

            return {
                success: true,
                item: data.data,
                message: "Items added successfully!",
            };
    }catch(error){
        console.error("Error adding item manually: ", error);
        throw new Error (error.message || "Failed to add item");
    }
}

export async function getPantryItems() {
    try {
        const user = await checkUser();

        console.log("User returned from checkUser:", user);

        if (!user) {
            throw new Error("User not authenticated");
        }

        console.log("Fetching pantry for user id:", user.id);

        const response = await fetch(
`${STRAPI_URL}/api/pantry-items?filters[users_permissions_user][id][$eq]=${user.id}&populate=*&sort=createdAt:desc`,
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                cache: "no-store",
            }
        );

        console.log("Pantry Response Status:", response.status);

        const responseBody = await response.text();

        console.log("Pantry Response Body:");
        console.log(responseBody);

        if (!response.ok) {
            throw new Error(responseBody);
        }

        const data = JSON.parse(responseBody);

        const isPro = user.subscriptiontier === "pro";

        return {
            success: true,
            items: data.data || [],
            scanslimit: isPro ? "unlimited" : 10,
        };

    } catch (error) {
        console.error("Error fetching pantry:", error);
        throw new Error(error.message || "Failed to load pantry");
    }
}


export async function deletePantryItem(formData) {
    try {
        const user = await checkUser();

        if (!user) {
            throw new Error("User not authenticated");
        }

        const id = formData.get("id");

        if (!id) {
            throw new Error("Item id is required");
        }

        const response = await fetch(
            `${STRAPI_URL}/api/pantry-items/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete item");
        }

        return {
            success: true,
            message: "Item removed from pantry",
        };
    } catch (error) {
        console.error("Error deleting item:", error);
        throw new Error(error.message || "Failed to delete item");
    }
}



export async function updatePantryItem(formData) {
    try {
        const user = await checkUser();

        if (!user) {
            throw new Error("User not authenticated");
        }

        const id = formData.get("id");
        const name = formData.get("name");
        const quantity = formData.get("quantity");

        if (!id || !name || !quantity) {
            throw new Error("Id, name and quantity are required");
        }

        const response = await fetch(
            `${STRAPI_URL}/api/pantry-items/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({
                    data: {
                        name,
                        quantity,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update item");
        }

        const data = await response.json();

        return {
            success: true,
            item: data.data,
            message: "Item updated successfully!",
        };
    } catch (error) {
        console.error("Error updating item:", error);
        throw new Error(error.message || "Failed to update item");
    }
}