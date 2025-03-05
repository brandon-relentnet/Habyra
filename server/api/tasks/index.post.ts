// server/api/tasks/index.post.ts
import { H3Event } from "h3";

// Define the task data interface
interface TaskData {
  id: number; // Client-side ID
  title: string;
  description?: string;
  completed: boolean;
  favorited: boolean;
  date?: string;
  time?: string;
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
        message: "You must be logged in to save tasks",
      });
    }

    // 2. Parse and validate request body
    const body = await readBody<TaskData>(event);

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

      // 4. Insert task record
      const taskParams = [
        userId,
        body.title,
        body.description || "",
        body.completed ? 1 : 0,
        body.favorited ? 1 : 0,
        body.date || null,
        body.time || null,
        body.id, // Store the client-side ID
      ];

      const [result] = await connection.execute(
        `INSERT INTO tasks (
          user_id, 
          title, 
          description, 
          completed, 
          favorited,
          task_date,
          task_time,
          client_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        taskParams
      );

      // Commit transaction
      await connection.commit();

      return {
        success: true,
        message: "Task saved successfully",
        taskId: (result as any).insertId,
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
    console.error("Error in tasks.post.ts:", error);

    // If this is not already a h3 error, create one
    if (!(error instanceof Error) || !("statusCode" in error)) {
      return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: (error as Error).message || "Failed to save task data",
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
