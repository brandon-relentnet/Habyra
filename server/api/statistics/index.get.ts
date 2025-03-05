// server/api/statistics/index.get.ts
import { H3Event } from "h3";
import { RowDataPacket } from "mysql2/promise";

interface SessionUser {
  id: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface StatsRow extends RowDataPacket {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  activity_logs: string;
  time_of_day_stats: string;
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
        message: "You must be logged in to access statistics",
      });
    }

    // 2. Get database connection
    const pool = (await import("../../utils/db")).default;
    const connection = await pool.getConnection();

    try {
      // 3. Get statistics data
      const [rows] = await connection.execute<StatsRow[]>(
        `SELECT 
          id,
          current_streak,
          longest_streak,
          last_active_date,
          activity_logs,
          time_of_day_stats
        FROM user_statistics 
        WHERE user_id = ?
        LIMIT 1`,
        [userId]
      );

      // If no stats exist yet, return empty defaults
      if (rows.length === 0) {
        return {
          success: true,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: "",
          activityLogs: [],
          timeOfDayStats: [
            { time: "Morning", completed: 0 },
            { time: "Afternoon", completed: 0 },
            { time: "Evening", completed: 0 },
            { time: "Night", completed: 0 },
          ],
        };
      }

      // 4. Format the data
      const statsRow = rows[0];

      return {
        success: true,
        currentStreak: statsRow.current_streak,
        longestStreak: statsRow.longest_streak,
        lastActiveDate: statsRow.last_active_date,
        activityLogs: JSON.parse(statsRow.activity_logs || "[]"),
        timeOfDayStats: JSON.parse(
          statsRow.time_of_day_stats ||
            JSON.stringify([
              { time: "Morning", completed: 0 },
              { time: "Afternoon", completed: 0 },
              { time: "Evening", completed: 0 },
              { time: "Night", completed: 0 },
            ])
        ),
      };
    } catch (error) {
      console.error("Database error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to retrieve statistics data",
      });
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    // Rethrow any error that occurred
    console.error("Error in statistics.get.ts:", error);
    throw error;
  }
});
