import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { targetMargin, discountThreshold } = await req.json();

    // Query active products from PostgreSQL to simulate inventory
    const docResult = await pool.query(
      "SELECT doc_id, document_name, product_category, trust_score FROM documents WHERE product_category IS NOT NULL LIMIT 5"
    );
    const documents = docResult.rows;

    const baseMargin = targetMargin || 25; // default 25% minimum margin policy
    const discountFactor = (discountThreshold || 95) / 100; // e.g. 95% of competitor price

    const pricingAuditResults = documents.map((doc, idx) => {
      // Seed base prices and competitor price benchmarks
      const basePrice = 200 + (idx * 150);
      const competitorPrice = 180 + (idx * 145);
      
      const targetDiscountedPrice = competitorPrice * discountFactor;
      const manufacturingCost = basePrice * 0.6; // 60% of base price is manufacturing cost
      const newMargin = ((targetDiscountedPrice - manufacturingCost) / targetDiscountedPrice) * 100;
      
      const approved = newMargin >= baseMargin;
      const status = approved ? "UPDATED" : "BLOCKED_BY_MARGIN_GUARDRAIL";
      
      return {
        doc_id: doc.doc_id,
        name: doc.document_name,
        category: doc.product_category,
        original_price: `$${basePrice.toFixed(2)}`,
        competitor_price: `$${competitorPrice.toFixed(2)}`,
        optimized_price: `$${targetDiscountedPrice.toFixed(2)}`,
        simulated_margin: `${newMargin.toFixed(1)}%`,
        status,
        compliance_check: approved ? "Passed Minimum Margin Threshold" : `Blocked: margin drops below ${baseMargin}% limit`
      };
    });

    const timestamp = new Date().toISOString();

    return NextResponse.json({
      status: "success",
      timestamp,
      margin_threshold_applied: `${baseMargin}%`,
      discount_applied: `${discountThreshold || 95}%`,
      overrides: pricingAuditResults,
      transaction_receipt: `TX-PRICING-${Math.floor(100000 + Math.random() * 900000)}`
    });
  } catch (err: any) {
    console.error("Pricing override agent error:", err);
    return NextResponse.json(
      { error: "Failed to run pricing override audit.", detail: err.message },
      { status: 500 }
    );
  }
}
