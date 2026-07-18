import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT doc_id, document_name, version, revision_notes, author, created_at, provenance 
       FROM documents 
       ORDER BY created_at DESC 
       LIMIT 30`
    );

    const commits = result.rows.map((doc, idx) => {
      // Generate pseudo-git hash from doc_id for realistic look
      const hash = doc.doc_id.split("-").pop() || "8a6edae7";
      const shortHash = hash.substring(0, 8);
      
      const lineage = doc.provenance?.lineage || [];
      const parentDoc = doc.provenance?.source_document || "Ingestion Pipeline";

      return {
        hash: shortHash,
        doc_id: doc.doc_id,
        name: doc.document_name,
        version: doc.version,
        author: doc.author || "system-ingest",
        date: doc.created_at,
        message: doc.revision_notes || `Imported product specification: ${doc.document_name} (v${doc.version})`,
        lineage,
        parentDoc,
        trustScore: doc.provenance?.trust_score || 0.85
      };
    });

    return NextResponse.json({
      status: "success",
      commits
    });
  } catch (err: any) {
    console.error("Versions API error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve knowledge version history.", detail: err.message },
      { status: 500 }
    );
  }
}
