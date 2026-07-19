import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyPassword, encryptSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
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
