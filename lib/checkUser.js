import { currentUser } from "@clerk/nextjs/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export const checkUser = async () => {
  try {
    const user = await currentUser();

    console.log("Current Clerk User:", user);

    if (!user) {
      console.log("No Clerk user found");
      return null;
    }

    if (!STRAPI_API_TOKEN) {
      console.log("Missing STRAPI_API_TOKEN");
      return null;
    }

    const subscriptiontier = "free";

    // Check if user already exists

    console.log("FETCH 1:", `${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}`);


    const existingUserResponse = await fetch(
      `${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      }
    );
   

    console.log("User Fetch Status:", existingUserResponse.status);

    if (!existingUserResponse.ok) {
      console.log(await existingUserResponse.text());
      return null;
    }

    const existingUserData = await existingUserResponse.json();

    console.log("Existing User Data:", existingUserData);

    // ==========================
    // USER EXISTS
    // ==========================
    if (existingUserData.length > 0) {
      const existingUser = existingUserData[0];

      console.log("Returning Existing User:", existingUser);

      return existingUser;
    }

    // ==========================
    // GET AUTHENTICATED ROLE
    // ==========================



    console.log("FETCH 2:", `${STRAPI_URL}/api/users-permissions/roles`);

    
    const rolesResponse = await fetch(
      `${STRAPI_URL}/api/users-permissions/roles`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!rolesResponse.ok) {
      console.log("Failed to fetch roles");
      return null;
    }

    const rolesData = await rolesResponse.json();

    const authenticatedRole = rolesData.roles.find(
      (role) => role.type === "authenticated"
    );

    if (!authenticatedRole) {
      console.log("Authenticated role not found");
      return null;
    }

    // ==========================
    // CREATE USER
    // ==========================

    const userData = {
      username:
        user.username ||
        user.emailAddresses[0].emailAddress.split("@")[0],

      email: user.emailAddresses[0].emailAddress,

      password: `clerk_${user.id}_${Date.now()}`,

      confirmed: true,
      blocked: false,

      role: authenticatedRole.id,

      clerkId: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      subscriptiontier,
    };


    console.log("FETCH 3:", `${STRAPI_URL}/api/users`);


    const newUserResponse = await fetch(`${STRAPI_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify(userData),
    });

    console.log("Create User Status:", newUserResponse.status);

    if (!newUserResponse.ok) {
      console.log(await newUserResponse.text());
      return null;
    }

    const newUser = await newUserResponse.json();

    console.log("Created User:", newUser);

    return newUser;
 } catch (error) {
    console.error("============== CHECK USER ERROR ==============");
    console.error(error);
    console.error(error.stack);
    console.error("==============================================");
    throw error;
}
};