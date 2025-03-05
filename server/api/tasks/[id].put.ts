// server/api/tasks/[id].put.ts
import { H3Event } from "h3";

// Define the task data interface
interface TaskData {
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
        message: "You must be logged in to update tasks",
      });
    }

    // 2. Get task ID from URL
    const clientId = event.context.params?.id;
    if (!clientId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing task ID",
      });
    }

    // 3. Parse and validate request body
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

    // 4. Get database connection
    const pool = (await import("../../utils/db")).default;
    connection = await pool.getConnection();

    try {
      // Check if task exists and belongs to user
      const [existingTasks] = await connection.execute(
        "SELECT id FROM tasks WHERE client_id = ? AND user_id = ?",
        [clientId, userId]
      );

      const existingTasksArray = existingTasks as any[];
      if (existingTasksArray.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Not Found",
          message: "Task not found or you don't have permission to update it",
        });
      }

      // Begin transaction
      await connection.beginTransaction();

      // 5. Update task record
      const taskParams = [
        body.title,
        body.description || "",
        body.completed ? 1 : 0,
        body.favorited ? 1 : 0,
        body.date || null,
        body.time || null,
        clientId,
        userId,
      ];

      await connection.execute(
        `UPDATE tasks SET
          title = ?, 
          description = ?, 
          completed = ?, 
          favorited = ?,
          task_date = ?,
          task_time = ?,
          updated_at = NOW()
        WHERE client_id = ? AND user_id = ?`,
        taskParams
      );

      // Commit transaction
      await connection.commit();

      return {
        success: true,
        message: "Task updated successfully",
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
    console.error("Error in task update:", error);

    // If this is not already a h3 error, create one
    if (!(error instanceof Error) || !("statusCode" in error)) {
      return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: (error as Error).message || "Failed to update task data",
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
