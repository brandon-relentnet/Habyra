// server/api/statistics/index.post.ts
import { H3Event } from "h3";

interface ActivityLog {
  date: string;
  completedTasks: number;
  totalTasks: number;
}

interface TimeStats {
  time: string;
  completed: number;
}

// Define the statistics data interface
interface StatsData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activityLogs: ActivityLog[];
  timeOfDayStats: TimeStats[];
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
        message: "You must be logged in to save statistics",
      });
    }

    // 2. Parse and validate request body
    const body = await readBody<StatsData>(event);

    // Basic validation
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing request body",
      });
    }

    // 3. Get database connection
    const pool = (await import("../../utils/db")).default;
    connection = await pool.getConnection();

    try {
      // Begin transaction
      await connection.beginTransaction();

      // Check if statistics record exists for this user
      const [existingStats] = await connection.execute(
        "SELECT id FROM user_statistics WHERE user_id = ?",
        [userId]
      );

      const existingStatsArray = existingStats as any[];

      if (existingStatsArray.length === 0) {
        // If no record exists, create a new one
        const statsParams = [
          userId,
          body.currentStreak,
          body.longestStreak,
          body.lastActiveDate || null,
          JSON.stringify(body.activityLogs || []),
          JSON.stringify(body.timeOfDayStats || []),
        ];

        await connection.execute(
          `INSERT INTO user_statistics (
            user_id, 
            current_streak, 
            longest_streak, 
            last_active_date, 
            activity_logs,
            time_of_day_stats
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          statsParams
        );
      } else {
        // If record exists, update it
        const statsParams = [
          body.currentStreak,
          body.longestStreak,
          body.lastActiveDate || null,
          JSON.stringify(body.activityLogs || []),
          JSON.stringify(body.timeOfDayStats || []),
          userId,
        ];

        await connection.execute(
          `UPDATE user_statistics SET
            current_streak = ?, 
            longest_streak = ?, 
            last_active_date = ?, 
            activity_logs = ?,
            time_of_day_stats = ?,
            updated_at = NOW()
          WHERE user_id = ?`,
          statsParams
        );
      }

      // Commit transaction
      await connection.commit();

      return {
        success: true,
        message: "Statistics saved successfully",
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
    console.error("Error in statistics.post.ts:", error);

    // If this is not already a h3 error, create one
    if (!(error instanceof Error) || !("statusCode" in error)) {
      return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: (error as Error).message || "Failed to save statistics data",
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
