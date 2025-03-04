// server/utils/auth-helper.ts
import { H3Event } from "h3";
import { getUserByEmail } from "./db";

/**
 * Gets the real database user ID from the session
 * This bridges the gap between Nuxt Auth and your database
 */
export async function getDbUserId(event: H3Event): Promise<number | null> {
  try {
    // 1. Get the current user session using Nuxt Auth
    const user = await getUserSession(event);

    console.log("User session:", user);

    // 2. Extract email from session (this should be consistent across browsers)
    if (!user.id) {
      console.log("No user email found in session");
      return null;
    }

    const userEmail = user.id;
    console.log("Found user email in session:", userEmail);

    // 3. Look up the user in the database to get the real user ID
    const dbUser = await getUserByEmail(userEmail);

    if (!dbUser) {
      console.log("User not found in database by email:", userEmail);
      return null;
    }

    console.log("Found user in database, ID:", dbUser.id);
    return dbUser.id; // This is the integer ID from your database
  } catch (error) {
    console.error("Error getting database user ID:", error);
    return null;
  }
}
