import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("eskos_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // expire immediately
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (err: any) {
    console.error("Logout API route error:", err);
    return NextResponse.json({ error: "Failed to logout user session." }, { status: 500 });
  }
}
