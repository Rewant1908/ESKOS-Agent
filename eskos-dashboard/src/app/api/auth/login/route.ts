import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyPassword, encryptSession, hashPassword } from "@/lib/auth";

let tableChecked = false;

async function ensureUsersTable() {
  if (tableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        tenant VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const checkRes = await pool.query("SELECT COUNT(*) FROM users");
    const count = parseInt(checkRes.rows[0]?.count || "0", 10);

    if (count === 0) {
      const defaultUsers = [
        { username: "admin", password: "admin123", role: "admin", tenant: "shared" },
        { username: "navin", password: "navin123", role: "reviewer", tenant: "goel-scientific" },
        { username: "kp", password: "kp123", role: "reviewer", tenant: "borosil-scientific" },
        { username: "purnima", password: "purnima123", role: "admin", tenant: "shared" },
      ];

      for (const u of defaultUsers) {
        const hash = await hashPassword(u.password);
        await pool.query(
          `INSERT INTO users (username, password_hash, role, tenant)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (username) DO NOTHING;`,
          [u.username, hash, u.role, u.tenant]
        );
      }
    }
    tableChecked = true;
  } catch (err) {
    console.error("[auth] Failed to auto-initialize users table:", err);
  }
}

export async function POST(request: Request) {
  try {
    await ensureUsersTable();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required fields." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT id, username, role, tenant, password_hash FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const { password_hash, ...user } = result.rows[0];
    const isPasswordValid = await verifyPassword(password, password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const sessionToken = encryptSession(user);

    const cookieStore = await cookies();
    cookieStore.set("eskos_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ status: "success", user });
  } catch (err: any) {
    console.error("Login API route error:", err);
    return NextResponse.json(
      { error: "Internal server error during login operation.", detail: err.message },
      { status: 500 }
    );
  }
}
