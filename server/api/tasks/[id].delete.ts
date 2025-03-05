// server/api/tasks/[id].delete.ts
import { H3Event } from "h3";

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
        message: "You must be logged in to delete tasks",
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

    // 3. Get database connection
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
          message: "Task not found or you don't have permission to delete it",
        });
      }

      // Begin transaction
      await connection.beginTransaction();

      // 4. Delete task record
      await connection.execute(
        "DELETE FROM tasks WHERE client_id = ? AND user_id = ?",
        [clientId, userId]
      );

      // Commit transaction
      await connection.commit();

      return {
        success: true,
        message: "Task deleted successfully",
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
    console.error("Error in task deletion:", error);

    // If this is not already a h3 error, create one
    if (!(error instanceof Error) || !("statusCode" in error)) {
      return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: (error as Error).message || "Failed to delete task",
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
