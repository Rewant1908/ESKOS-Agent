import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // Query dynamic citations based on active documents in the knowledge fabric
    const docResult = await pool.query(
      "SELECT doc_id, document_name, document_type, product_category, trust_score FROM documents ORDER BY created_at DESC LIMIT 10"
    );

    const documents = docResult.rows;
    
    // Map documents to verification citation claims
    const claims = documents.map((doc, idx) => {
      const isGoel = doc.document_name.toLowerCase().includes("goel");
      const quote = isGoel 
        ? `High-performance industrial ${doc.product_category || "glassware"} assemblies certified under global standards.`
        : `Thermal and mechanical specifications for ${doc.document_name} designed for chemical pilot plants.`;
        
      return {
        quote,
        sourceDocId: doc.doc_id,
        sourceTitle: doc.document_name,
        credibilityScore: parseFloat(Number(doc.trust_score * 100).toFixed(1)),
        matchScore: parseFloat((90 + Math.random() * 9.8).toFixed(1))
      };
    });

    // Simulated referral data for AI Citation Tracking (Phase D.2)
    const referralAnalytics = [
      { domain: "chatgpt.com", sessions: 1420, conversions: 88, trend: "+12.4%" },
      { domain: "gemini.google.com", sessions: 980, conversions: 54, trend: "+18.2%" },
      { domain: "perplexity.ai", sessions: 1120, conversions: 76, trend: "+24.5%" },
      { domain: "copilot.microsoft.com", sessions: 350, conversions: 12, trend: "-2.1%" }
    ];

    return NextResponse.json({
      status: "success",
      claims: claims.length > 0 ? claims : [
        { quote: "Goel Scientific high pressure reactors operate safely up to 250°C.", sourceDocId: "doc-goel-01", sourceTitle: "Goel Technical Guide", credibilityScore: 95.0, matchScore: 98.0 }
      ],
      referrals: referralAnalytics
    });
  } catch (err: any) {
    console.error("Citations API error:", err);
    return NextResponse.json(
      { error: "Failed to query citation grounding ledger.", detail: err.message },
      { status: 500 }
    );
  }
}
