// server/api/pomodoro/sessions.post.ts
import { H3Event } from "h3";

// Define the session data interface
interface SessionData {
  date: string;
  duration: number;
  type: "work" | "short_break" | "long_break";
}

interface SessionUser {
  id: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// Helper function to get week number
function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default defineEventHandler(async (event: H3Event) => {
  const todayStr = new Date().toISOString().split("T")[0];
  let connection = null;

  try {
    console.log("Pomodoro session save started");

    // 1. Get authenticated user
    const user = (await requireUserSession(event)) as unknown as SessionUser;
    const userId = user.user.id;
    console.log("User authenticated:", userId);

    if (!user || !userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "You must be logged in to save sessions",
      });
    }

    // 2. Parse and validate request body
    const body = await readBody<SessionData>(event);
    console.log("Received body:", JSON.stringify(body));

    // Basic validation
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing request body",
      });
    }

    if (!body.date) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing date field",
      });
    }

    if (typeof body.duration !== "number") {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Invalid duration: ${body.duration}, expected a number`,
      });
    }

    if (!body.type) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Missing type field",
      });
    }

    // Validate session type
    if (!["work", "short_break", "long_break"].includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: `Invalid session type: ${body.type}`,
      });
    }

    // 3. Get database connection
    console.log("Getting database connection");
    const pool = (await import("../../utils/db")).default;
    connection = await pool.getConnection();
    console.log("Database connection established");

    try {
      // Begin transaction
      console.log("Beginning transaction");
      await connection.beginTransaction();

      // 4. Insert session record
      console.log("Inserting session record");
      const sessionDate = new Date(body.date);
      console.log("Parsed date:", sessionDate);

      const sessionParams = [userId, sessionDate, body.duration, body.type];
      console.log("Session params:", sessionParams);

      try {
        const [sessionResult] = await connection.execute(
          `INSERT INTO pomodoro_sessions (
            user_id, 
            session_date, 
            duration, 
            session_type
          ) VALUES (?, ?, ?, ?)`,
          sessionParams
        );
        console.log("Session inserted successfully");
      } catch (sqlError) {
        console.error("SQL Error inserting session:", sqlError);
        const errorMessage = (sqlError as Error).message || "Unknown error";
        throw createError({
          statusCode: 500,
          statusMessage: "Database Error",
          message: `Error inserting session: ${errorMessage}`,
        });
      }

      // 5. Update statistics (only for work sessions)
      if (body.type === "work") {
        console.log("Updating statistics for work session");

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const currentWeek = getWeekNumber(new Date());
        console.log("Today:", today, "Current week:", currentWeek);

        // Check if statistics record exists
        try {
          console.log("Checking for existing statistics");
          const [statsRows] = await connection.execute(
            "SELECT * FROM pomodoro_statistics WHERE user_id = ?",
            [userId]
          );

          console.log("Stats query result:", statsRows);

          if (Array.isArray(statsRows) && statsRows.length > 0) {
            console.log("Updating existing statistics");
            // Update existing statistics
            await connection.execute(
              `UPDATE pomodoro_statistics 
              SET 
                total_sessions = total_sessions + 1,
                total_focus_time = total_focus_time + ?,
                sessions_today = IF(DATE(last_session_date) = ?, sessions_today + 1, 1),
                sessions_this_week = IF(last_week_number = ?, sessions_this_week + 1, 1),
                last_session_date = ?,
                last_week_number = ?,
                updated_at = NOW()
              WHERE user_id = ?`,
              [body.duration, today, currentWeek, todayStr, currentWeek, userId]
            );
            console.log("Statistics updated successfully");
          } else {
            console.log("Creating new statistics record");
            // Create new statistics record
            await connection.execute(
              `INSERT INTO pomodoro_statistics (
                user_id,
                total_sessions,
                total_focus_time,
                sessions_today,
                sessions_this_week,
                last_session_date,
                last_week_number
              ) VALUES (?, 1, ?, 1, 1, ?, ?)`,
              [userId, body.duration, todayStr, currentWeek]
            );
            console.log("New statistics record created");
          }
        } catch (statsError) {
          console.error("SQL Error updating statistics:", statsError);
          throw createError({
            statusCode: 500,
            statusMessage: "Database Error",
            message: `Error updating statistics: ${
              (statsError as Error).message || "Unknown error"
            }`,
          });
        }
      }

      // Commit transaction
      console.log("Committing transaction");
      await connection.commit();
      console.log("Transaction committed successfully");

      return {
        success: true,
        message: "Session saved successfully",
      };
    } catch (error) {
      // Rollback the transaction if there's an error
      console.error("Error during transaction, rolling back:", error);
      if (connection) {
        await connection.rollback();
        console.log("Transaction rolled back");
      }

      // Rethrow the error
      throw error;
    }
  } catch (error) {
    // Format and log the error
    console.error("Error in sessions.post.ts:", error);

    // If this is not already a h3 error, create one
    if (!(error instanceof Error) || !("statusCode" in error)) {
      return createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: (error as Error).message || "Failed to save session data",
        data: error,
      });
    }

    // Rethrow h3 errors
    return error;
  } finally {
    // Release the connection
    if (connection) {
      connection.release();
      console.log("Database connection released");
    }
  }
});
