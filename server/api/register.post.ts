// server/api/register.post.ts
import { z } from "zod";
import { createUser } from "../utils/db";

const bodySchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

export default defineEventHandler(async (event) => {
  try {
    const userData = await readValidatedBody(event, bodySchema.parse);

    // Create user in database
    const { passwordConfirm, ...userDataWithoutConfirm } = userData;
    const newUser = await createUser(userDataWithoutConfirm);

    // Auto-login by setting the session
    await setUserSession(event, {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  } catch (error: any) {
    // Handle validation errors
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        message: "Validation error",
        data: error.errors,
      });
    }

    // Handle existing email error
    if (error.message === "Email already exists") {
      throw createError({
        statusCode: 409,
        message: error.message,
      });
    }

    // Log the error and return a generic error
    console.error("Registration error:", error);
    throw createError({
      statusCode: 500,
      message: "An error occurred during registration",
    });
  }
});
