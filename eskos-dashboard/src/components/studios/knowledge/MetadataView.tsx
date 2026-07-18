"use client";

import React from "react";
import { Binary, Plus, ShieldCheck } from "lucide-react";

export default function MetadataView() {
  const schemas = [
    { type: "product_datasheet", fields: ["product_name", "material", "dimensions", "applications", "category"], count: 10 },
    { type: "scientific_paper", fields: ["title", "authors", "abstract", "journal", "published_date"], count: 0 },
    { type: "safety_sop", fields: ["sop_id", "title", "department", "last_revised", "safety_hazards"], count: 0 },
  ];

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Metadata Manager</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Configure validation schemas and schema structural types for enterprise knowledge ingestion.</p>
        </div>
        <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans">
          <Plus className="w-3.5 h-3.5" />
          <span>New Schema</span>
        </button>
      </div>

      <div className="space-y-4">
        {schemas.map((schema) => (
          <div key={schema.type} className="bg-card border border-border p-5 rounded-lg space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <Binary className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-slate-200 font-mono">{schema.type}</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-muted-foreground">{schema.count} documents registered</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {schema.fields.map((field) => (
                <span key={field} className="flex items-center space-x-1 border border-border px-2.5 py-1 rounded bg-muted/20 text-xs font-mono text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>{field}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
