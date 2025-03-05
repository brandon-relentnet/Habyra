// server/api/goals/index.get.ts
import { H3Event } from "h3";
import { RowDataPacket } from "mysql2/promise";

interface GoalRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  category: string;
  target_date: string | null;
  completed: boolean;
  created_at: string;
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
        message: "You must be logged in to access goals",
      });
    }

    // 2. Get database connection
    const pool = (await import("../../utils/db")).default;
    const connection = await pool.getConnection();

    try {
      // 3. Get goals data
      const [goalRows] = await connection.execute<GoalRow[]>(
        `SELECT 
          id,
          title,
          description,
          category,
          target_date,
          completed,
          created_at,
          client_id
        FROM goals 
        WHERE user_id = ?
        ORDER BY created_at DESC`,
        [userId]
      );

      // 4. Format the data to match the client-side format
      const goals = goalRows.map((goal) => ({
        id: goal.client_id, // Use client_id as the id for the frontend
        title: goal.title,
        description: goal.description || "",
        category: goal.category as "short" | "long" | "life",
        targetDate: goal.target_date
          ? new Date(goal.target_date).toISOString().split("T")[0]
          : undefined,
        completed: Boolean(goal.completed),
        createdAt: new Date(goal.created_at).toISOString(),
        synced: true, // Mark all server goals as synced
        serverId: goal.id, // Keep track of the server ID
      }));

      return {
        goals,
        success: true,
      };
    } catch (error) {
      console.error("Database error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to retrieve goals data",
      });
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    // Rethrow any error that occurred
    console.error("Error in goals.get.ts:", error);
    throw error;
  }
});
