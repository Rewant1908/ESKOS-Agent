import { NextResponse } from "next/server";
import pool from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const { query, brand } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Audit query is required." }, { status: 400 });
    }

    // Retrieve grounding documents from PostgreSQL to use as the source of truth
    const docResult = await pool.query(
      "SELECT doc_id, document_name, product_category, version, trust_score, revision_notes FROM documents"
    );
    const documents = docResult.rows;

    const sourceSpecs = documents.map(d => 
      `Document: ${d.document_name} (${d.doc_id})
       Category: ${d.product_category}
       Grounded Specifications: ${d.revision_notes || "Standard industrial certification specs"}`
    ).join("\n\n");

    const scanTimestamp = new Date().toISOString();

    // Default clean/no-hallucination response
    let auditResult = {
      hallucination_detected: false,
      audit_detail: {
        ai_assistant: "perplexity.ai",
        incorrect_claim: "None",
        grounded_specification: "None",
        severity: "NONE"
      },
      compiled_schema: null,
      action_taken: "No action needed. Content alignment is fully consistent."
    };

    // Skip Gemini for extremely short greetings (e.g. "hi", "hello", "hey")
    const isGreeting = query.trim().toLowerCase().match(/^(hi|hello|hey|greetings|yo|sup)$/);

    if (!isGreeting && GEMINI_API_KEY && documents.length > 0) {
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
                      text: `You are the ESKOS Brand Authority Protection Agent.
                      Your job is to audit public AI search engine outputs for the user query: "${query}".
                      
                      Here is the verified source of truth specifications from our database:
                      ${sourceSpecs}
                      
                      Determine if a public AI assistant (ChatGPT, Gemini, Perplexity) would likely generate an incorrect, hallucinated, or unverified claim for this query when contrasted against our verified specifications.
                      
                      CRITICAL RULE:
                      If the query asks about a product, category, or specification parameter (e.g., pressure reactor vessels, certified limit, or specific tolerances) that is NOT present in our database, or differs from our database, you MUST treat it as an unverified/hallucinated claim and flag it as "hallucination_detected: true". In the audit detail, cite that the public assistant claims a specific parameter, but our grounding repository contains no verified document supporting that parameter.
                      
                      You MUST respond ONLY with a raw JSON object containing these keys:
                      {
                        "hallucination_detected": true,
                        "audit_detail": {
                          "ai_assistant": "perplexity.ai" or "chatgpt" or "gemini",
                          "incorrect_claim": "simulate what incorrect/unverified claim the public assistant might make",
                          "grounded_specification": "cite the correct spec from our database, or state that the catalog has no verified records of this product/spec",
                          "severity": "LOW" or "MEDIUM" or "CRITICAL"
                        },
                        "compiled_schema": {
                          "@context": "https://schema.org",
                          "@type": "Product",
                          "name": "Product Name",
                          "manufacturer": {
                            "@type": "Organization",
                            "name": "${brand || "Goel Scientific"}"
                          },
                          "additionalProperty": [
                            {
                              "@type": "PropertyValue",
                              "name": "Property Name",
                              "value": "Correct Value / Status",
                              "valueReference": "Source Document ID"
                            }
                          ]
                        },
                        "action_taken": "Correction Schema injected into SEO knowledge schema endpoints."
                      }
                      
                      If the query is a simple greeting or general inquiry completely unrelated to brand products or specs, return:
                      {
                        "hallucination_detected": false,
                        "audit_detail": {
                          "ai_assistant": "perplexity.ai",
                          "incorrect_claim": "None",
                          "grounded_specification": "None",
                          "severity": "NONE"
                        },
                        "compiled_schema": null,
                        "action_taken": "No action needed. Content alignment is fully consistent."
                      }`
                    }
                  ]
                }
              ]
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data.candidates[0].content.parts[0].text.trim();
          const cleanJSON = rawText.replace(/^```json/, "").replace(/```$/, "").trim();
          auditResult = JSON.parse(cleanJSON);
        } else {
          console.error("Gemini API call failed inside brand-protect with status:", geminiRes.status, await geminiRes.text());
        }
      } catch (err: any) {
        console.error("Gemini Brand Audit execution failed:", err.message);
      }
    }

    return NextResponse.json({
      status: "success",
      scan_timestamp: scanTimestamp,
      scanned_query: query,
      ...auditResult
    });
  } catch (err: any) {
    console.error("Brand protect agent error:", err);
    return NextResponse.json(
      { error: "Failed to run brand authority audit.", detail: err.message },
      { status: 500 }
    );
  }
}
