// server/api/tasks/index.get.ts
import { H3Event } from "h3";
import { RowDataPacket } from "mysql2/promise";

interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  favorited: boolean;
  task_date: string | null;
  task_time: string | null;
  client_id: number;
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
  try {
    // 1. Get authenticated user
    const user = (await requireUserSession(event)) as unknown as SessionUser;
    const userId = user.user.id;

    if (!user || !userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "You must be logged in to access tasks",
      });
    }

    // 2. Get database connection
    const pool = (await import("../../utils/db")).default;
    const connection = await pool.getConnection();

    try {
      // 3. Get tasks data
      const [taskRows] = await connection.execute<TaskRow[]>(
        `SELECT 
          id,
          title,
          description,
          completed,
          favorited,
          task_date,
          task_time,
          client_id
        FROM tasks 
        WHERE user_id = ?
        ORDER BY id DESC`,
        [userId]
      );

      // 4. Format the data to match the client-side format
      const tasks = taskRows.map((task) => ({
        id: task.client_id, // Use client_id as the id for the frontend
        title: task.title,
        description: task.description || "",
        completed: Boolean(task.completed),
        favorited: Boolean(task.favorited),
        date: task.task_date
          ? new Date(task.task_date).toISOString().split("T")[0]
          : null,
        time: task.task_time || null,
        synced: true, // Mark all server tasks as synced
        serverId: task.id, // Keep track of the server ID
      }));

      return {
        tasks,
        success: true,
      };
    } catch (error) {
      console.error("Database error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to retrieve tasks data",
      });
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    // Rethrow any error that occurred
    console.error("Error in tasks.get.ts:", error);
    throw error;
  }
});
