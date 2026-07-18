import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT query_id AS id, query_text, trust_score, matched_chunks_count, response_status, created_at FROM query_logs ORDER BY created_at DESC LIMIT 30"
    );
    
    return NextResponse.json({
      status: "success",
      runs: result.rows
    });
  } catch (err: any) {
    console.error("Agent runs API error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve agent execution runs.", detail: err.message },
      { status: 500 }
    );
  }
}
