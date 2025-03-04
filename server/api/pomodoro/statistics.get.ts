// server/api/pomodoro/statistics.get.ts
import { H3Event } from "h3";
import { RowDataPacket } from "mysql2/promise";

// Define interfaces for our database rows
interface StatisticsRow extends RowDataPacket {
  totalSessions: number;
  totalFocusTime: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  lastSessionDate: string | null;
  lastWeekNumber: number | null;
}

interface SessionRow extends RowDataPacket {
  date: Date;
  duration: number;
  type: string;
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
        message: "You must be logged in to access statistics",
      });
    }

    // 2. Get database connection
    const pool = (await import("../../utils/db")).default;
    const connection = await pool.getConnection();

    try {
      // 3. Get statistics data
      const [statsRows] = await connection.execute<StatisticsRow[]>(
        `SELECT 
          total_sessions as totalSessions,
          total_focus_time as totalFocusTime,
          sessions_today as sessionsToday,
          sessions_this_week as sessionsThisWeek,
          last_session_date as lastSessionDate,
          last_week_number as lastWeekNumber
        FROM pomodoro_statistics 
        WHERE user_id = ?`,
        [userId]
      );

      // 4. Get recent session history (most recent 100 sessions)
      const [sessionRows] = await connection.execute<SessionRow[]>(
        `SELECT 
          session_date as date,
          duration,
          session_type as type
        FROM pomodoro_sessions 
        WHERE user_id = ? AND session_type = 'work'
        ORDER BY session_date DESC 
        LIMIT 100`,
        [userId]
      );

      // 5. Format the data to match the client-side format
      const sessions = sessionRows.map((session) => ({
        date: new Date(session.date).toISOString(),
        duration: session.duration,
        type: session.type,
        synced: true, // Mark all server sessions as synced
      }));

      const stats =
        statsRows.length > 0
          ? {
              completedSessions: statsRows[0].totalSessions || 0,
              completedToday: statsRows[0].sessionsToday || 0,
              completedThisWeek: statsRows[0].sessionsThisWeek || 0,
              totalFocusTime: statsRows[0].totalFocusTime || 0,
              lastSessionDate: statsRows[0].lastSessionDate
                ? new Date(statsRows[0].lastSessionDate).toDateString()
                : new Date().toDateString(),
              lastWeekNumber: statsRows[0].lastWeekNumber || 0,
              sessionsHistory: sessions,
            }
          : {
              completedSessions: 0,
              completedToday: 0,
              completedThisWeek: 0,
              totalFocusTime: 0,
              lastSessionDate: new Date().toDateString(),
              lastWeekNumber: 0,
              sessionsHistory: sessions, // Still include any sessions even if no stats record
            };

      const result = {
        statistics: stats,
        success: true,
      };

      return result;
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
