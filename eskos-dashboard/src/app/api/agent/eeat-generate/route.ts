import { NextResponse } from "next/server";
import pool from "@/lib/db";

const KONG_BASE_URL = process.env.KONG_BASE_URL || "http://localhost:8000";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const { topic, orgId } = await req.json();

    // Query active product documents from the PostgreSQL Knowledge Fabric database
    const docResult = await pool.query(
      "SELECT doc_id, document_name, document_type, product_category, trust_score FROM documents WHERE product_category IS NOT NULL LIMIT 4"
    );
    const documents = docResult.rows;

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "No scientific source documents found in Knowledge Fabric." },
        { status: 400 }
      );
    }

    // Prepare RAG context mapping document IDs to trust indices
    const documentContext = documents.map(d => 
      `Document ID: ${d.doc_id}\nTitle: ${d.document_name}\nCategory: ${d.product_category}\nTrust Score: ${d.trust_score}`
    ).join("\n\n");

    // Formulate a structured payload using Gemini to write E-E-A-T scientific content with grounding citations
    let generatedContent = "";
    if (GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are the ESKOS Scientific Content Generator Agent.
                      Write a detailed scientific product article or technical datasheet about the topic: "${topic}".
                      
                      You MUST strictly ground all claims in the following source documents:
                      ${documentContext}
                      
                      When you state a fact from a document, you MUST append an inline citation with the exact Document ID in square brackets, e.g., [source: ${documents[0]?.doc_id}].
                      Format the output in beautiful Markdown containing:
                      - Title
                      - Technical Overview
                      - Materials & Temperature Tolerances
                      - Safety Grounding References
                      `
                    }
                  ]
                }
              ]
            })
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          generatedContent = geminiData.candidates[0].content.parts[0].text;
        } else {
          console.error("Gemini API returned error code:", geminiRes.status);
          generatedContent = `Mock E-E-A-T content draft for topic: ${topic}. Grounded in ${documents[0]?.document_name} [source: ${documents[0]?.doc_id}].`;
        }
      } catch (err: any) {
        console.error("Gemini API call failed:", err.message);
        generatedContent = `Mock E-E-A-T content draft for topic: ${topic}. Grounded in ${documents[0]?.document_name} [source: ${documents[0]?.doc_id}].`;
      }
    } else {
      generatedContent = `Mock E-E-A-T content draft for topic: ${topic}. Grounded in ${documents[0]?.document_name} [source: ${documents[0]?.doc_id}].`;
    }

    // Submit the generated scientific draft to the content-governance review queue (via Kong proxy)
    let rawBase = process.env.KONG_BASE_URL || process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";
    if (rawBase.startsWith("/")) rawBase = "http://localhost:8000";
    const cleanBase = rawBase.replace(/\/api\/v1\/?$/, "");
    const GOVERNANCE_API_KEY = process.env.GOVERNANCE_API_KEY || "eskos-governance-secret-key-2026";

    const draftId = `draft-${Math.random().toString(36).substring(2, 8)}`;
    await fetch(`${cleanBase}/api/v1/governance/drafts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": GOVERNANCE_API_KEY,
      },
      body: JSON.stringify({
        draft_id: draftId,
        org_id: orgId || "goel-scientific",
        author_agent: "Scientific E-E-A-T Content Generator (Agent 4)",
        content: generatedContent,
        status: "PENDING",
        created_at: new Date().toISOString()
      })
    });

    return NextResponse.json({
      status: "success",
      draft_id: draftId,
      content: generatedContent,
      grounded_sources: documents.map(d => ({ id: d.doc_id, name: d.document_name }))
    });
  } catch (err: any) {
    console.error("E-E-A-T Generator error:", err);
    return NextResponse.json(
      { error: "Failed to generate groundable scientific content.", detail: err.message },
      { status: 500 }
    );
  }
}
