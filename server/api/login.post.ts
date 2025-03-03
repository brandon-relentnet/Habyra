// server/api/login.post.ts
import { z } from "zod";
import { verifyUser } from "../utils/db";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readValidatedBody(
      event,
      bodySchema.parse
    );

    // Verify user credentials against database
    const user = await verifyUser(email, password);

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    // Set user session in the cookie
    await setUserSession(event, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    return { success: true };
  } catch (error: any) {
    // Handle validation errors
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        message: "Validation error",
        data: error.errors,
      });
    }

    // Re-throw other errors
    throw error;
  }
});
