// server/utils/db.ts
import mysql from "mysql2/promise";
import { hash, compare } from "bcrypt";

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "healthyheart",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database - create tables if they don't exist
export async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// User related functions
export async function getUserByEmail(email: string) {
  const [rows]: [any[], mysql.FieldPacket[]] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0] || null;
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await hash(userData.password, 10);

  try {
    const [result]: [mysql.ResultSetHeader, mysql.FieldPacket[]] =
      await pool.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [userData.name, userData.email, hashedPassword]
      );

    return {
      id: result.insertId,
      name: userData.name,
      email: userData.email,
    };
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Email already exists");
    }
    throw error;
  }
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatch = await compare(password, user.password);

  if (!passwordMatch) {
    return null;
  }

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export default pool;
