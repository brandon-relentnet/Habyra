// server/api/goals/index.post.ts
import { H3Event } from "h3";

// Define the goal data interface
interface GoalData {
  id: number; // Client-side ID
  title: string;
  description?: string;
  category: "short" | "long" | "life";
  targetDate?: string;
  completed: boolean;
  createdAt: string;
}

interface SessionUser {
  id: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default defineEventHandler(async (event: H3Event) => {
  let connection = null;

  try {
    // 1. Get authenticated user
    const user = (await requireUserSession(event)) as unknown as SessionUser;
    const userId = user.user.id;

    if (!user || !userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "You must be logged in to save goals",
      });
    }

    // 2. Parse and validate request body
    const body = await readBody<GoalData>(event);

    // Basic validation
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing request body",
      });
    }

    if (!body.title) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing title field",
      });
    }

    // 3. Get database connection
    const pool = (await import("../../utils/db")).default;
    connection = await pool.getConnection();

    try {
      // Begin transaction
      await connection.beginTransaction();

      // Format the createdAt date properly for MySQL
      // MySQL expects YYYY-MM-DD HH:MM:SS format
      let formattedCreatedAt = new Date();
      if (body.createdAt) {
        try {
          formattedCreatedAt = new Date(body.createdAt);
        } catch (e) {
          console.error("Error parsing date:", e);
          // Use current date as fallback
        }
      }

      // Format to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      const mysqlDatetime = formattedCreatedAt
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d+Z$/, "");

      // 4. Insert goal record
      const goalParams = [
        userId,
        body.title,
        body.description || "",
        body.category,
        body.targetDate || null,
        body.completed ? 1 : 0,
        mysqlDatetime, // Use properly formatted date
        body.id, // Store the client-side ID
      ];

      const [result] = await connection.execute(
        `INSERT INTO goals (
          user_id, 
          title, 
          description, 
          category, 
          target_date, 
          completed, 
          created_at,
          client_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        goalParams
      );

      // Commit transaction
      await connection.commit();

      return {
        success: true,
        message: "Goal saved successfully",
        goalId: (result as any).insertId,
        clientId: body.id,
      };
    } catch (error) {
      // Rollback the transaction if there's an error
      console.error("Error during transaction, rolling back:", error);
      if (connection) {
        await connection.rollback();
      }

      // Rethrow the error
      throw error;
    }
  } catch (error) {
    // Format and log the error
    console.error("Error in goals.post.ts:", error);

    // If this is not already a h3 error, create one
    if (!(error instanceof Error) || !("statusCode" in error)) {
      return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: (error as Error).message || "Failed to save goal data",
        data: error,
      });
    }

    // Rethrow h3 errors
    return error;
  } finally {
    // Release the connection
    if (connection) {
      connection.release();
    }
  }
});
