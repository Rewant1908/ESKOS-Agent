import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptSession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("eskos_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ user: null });
    }

    const user = decryptSession(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Session API route error:", err);
    return NextResponse.json({ user: null });
  }
}
