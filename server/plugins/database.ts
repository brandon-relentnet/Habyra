// server/plugins/database.ts
import { initDatabase } from "../utils/db";

export default defineNitroPlugin(async () => {
  try {
    // Initialize the database when the server starts
    await initDatabase();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
  }
});
