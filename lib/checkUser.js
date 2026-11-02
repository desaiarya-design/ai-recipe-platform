import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const checkUser = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  try {
    await connectDB();

    let user = await User.findOne({
      clerkId: clerkUser.id,
    });

    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        username:
          clerkUser.username ||
          clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
          "user",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        imageUrl: clerkUser.imageUrl || "",
        subscriptionTier: "free",
      });
    }

    return {
      id: user._id.toString(),
      _id: user._id.toString(),
      clerkId: user.clerkId,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      subscriptiontier: "free",
      subscriptionTier: "free",
    };
  } catch (error) {
    console.error("Database error in checkUser:", error);
    throw new Error(
      "Database connection failed. Please ensure MongoDB is running or set your MONGODB_URI in frontend/.env"
    );
  }
};