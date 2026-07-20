import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let rawBase = process.env.KONG_BASE_URL || process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";
    if (rawBase.startsWith("/")) {
      rawBase = "http://localhost:8000";
    }
    const cleanBase = rawBase.replace(/\/api\/v1\/?$/, "");
    const GOVERNANCE_API_KEY = process.env.GOVERNANCE_API_KEY || "eskos-governance-secret-key-2026";
    const targetUrl = `${cleanBase}/api/v1/governance/review?apikey=${encodeURIComponent(GOVERNANCE_API_KEY)}`;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("eskos_session");
    let reviewerId = "anonymous-reviewer";

    if (sessionCookie && sessionCookie.value) {
      const user = decryptSession(sessionCookie.value);
      if (user && user.username) {
        reviewerId = user.username;
      }
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": GOVERNANCE_API_KEY,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        ...body,
        reviewer_id: reviewerId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Failed to submit review decision to Gateway." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Governance review proxy error:", err);
    return NextResponse.json(
      { error: "Internal server error during review proxy.", detail: err.message },
      { status: 500 }
    );
  }
}
