import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, session_id, org_id, caller_id, query_text, reply_preview,
              trace, input_tokens, output_tokens, usd_cost, model,
              blocked_input, created_at
       FROM agent_runs ORDER BY created_at DESC LIMIT 50`
    );
    return NextResponse.json({ status: "success", runs: result.rows });
  } catch (err: any) {
    console.error("Agent runs API error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve agent execution runs.", detail: err.message },
      { status: 500 }
    );
  }
}
