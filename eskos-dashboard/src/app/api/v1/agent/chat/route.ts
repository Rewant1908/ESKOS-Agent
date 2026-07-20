import { NextResponse } from "next/server";

export const maxDuration = 120; // Allow up to 120s execution time for deep multi-agent reasoning

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orgId = req.headers.get("x-eskos-org-id") || "goel-scientific";
    
    let rawBase = process.env.KONG_BASE_URL || process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";
    if (!rawBase || rawBase.startsWith("/")) {
      rawBase = "http://localhost:8000";
    }
    const cleanBase = rawBase.replace(/\/api\/v1\/?$/, "");
    const targetUrl = `${cleanBase}/api/v1/agent/chat`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000); // 120 seconds timeout limit

    const upstreamRes = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-eskos-org-id": orgId,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      return NextResponse.json(
        { error: `Upstream Agent Runtime error (${upstreamRes.status}): ${errorText}` },
        { status: upstreamRes.status }
      );
    }

    const data = await upstreamRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[api/v1/agent/chat] Server route error:", err);
    return NextResponse.json(
      { error: "Agent execution failed in server route.", detail: err.message },
      { status: 500 }
    );
  }
}
