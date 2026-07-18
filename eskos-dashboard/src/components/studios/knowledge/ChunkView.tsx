"use client";

import React, { useState } from "react";
import { Layers } from "lucide-react";

export default function ChunkView() {
  const [selectedSize, setSelectedSize] = useState(500);

  const chunks = [
    { id: "chunk-0", length: 142, text: "A Liebig Condenser is a simple glass condenser design, consisting of a straight inner tube surrounded by an outer water jacket. The coolant flows in the opposite direction of the vapor to maximize heat exchange efficiency." },
    { id: "chunk-1", length: 110, text: "Applications for the Liebig Condenser include general distillation systems, reflux operations, and organic chemistry extractions. It is typically crafted from Borosilicate Glass 3.3 to handle high thermal shock gradients." },
  ];

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Chunk Explorer</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Inspect how raw documents are parsed and segmented into vector chunks for the RAG indexing system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Config Panel */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Chunking Variables</h3>
          <div className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <span className="text-muted-foreground">Chunk Size (chars):</span>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(parseInt(e.target.value))}
                className="w-full bg-background text-slate-200 border border-border outline-none p-2 rounded"
              >
                <option value={500}>500 characters</option>
                <option value={1000}>1000 characters</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-muted-foreground">Overlap:</span>
              <p className="text-slate-200 bg-background/50 border border-border p-2 rounded">10% (50 chars)</p>
            </div>
          </div>
        </div>

        {/* Chunks List */}
        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Document Segments</h3>
            <span className="text-[10px] font-mono text-muted-foreground">2 chunks generated</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {chunks.map((chunk) => (
              <div key={chunk.id} className="p-4 rounded bg-muted/20 border border-border space-y-2 select-text">
                <div className="flex justify-between items-center font-mono text-[10px] text-muted-foreground select-none">
                  <span className="flex items-center space-x-1 font-semibold text-primary">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{chunk.id}</span>
                  </span>
                  <span>{chunk.length} tokens</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">{chunk.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
