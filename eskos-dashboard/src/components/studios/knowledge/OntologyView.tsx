"use client";

import React from "react";
import { Compass, Plus, GitMerge } from "lucide-react";

export default function OntologyView() {
  const nodes = [
    { name: "Product", description: "Scientific instruments, glassware, and lab items." },
    { name: "Material", description: "Chemical substances and glassware composition specifications." },
    { name: "Application", description: "Scientific processes, distillation, chemistry use-cases." },
  ];

  const relations = [
    { from: "Product", label: "hasMaterial", to: "Material" },
    { from: "Product", label: "usedFor", to: "Application" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Ontology Manager</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">Define logical classes, structural ontologies, and entity relationship rules for the knowledge graph.</p>
        </div>
        <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans">
          <Plus className="w-3.5 h-3.5" />
          <span>New Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Card */}
        <div className="bg-card border border-border rounded-lg p-5 lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Entity Classes</h3>
          <div className="space-y-2">
            {nodes.map((node) => (
              <div key={node.name} className="flex justify-between items-start p-3 rounded bg-muted/20 border border-border font-sans">
                <div>
                  <span className="text-xs font-semibold text-slate-200">{node.name}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{node.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relations Card */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Ontology Relations</h3>
          <div className="space-y-3 font-mono text-[10px]">
            {relations.map((rel, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded bg-muted/20 border border-border">
                <span className="text-slate-300 font-semibold">{rel.from}</span>
                <div className="flex flex-col items-center px-2">
                  <GitMerge className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[8px] text-primary uppercase font-bold mt-0.5">{rel.label}</span>
                </div>
                <span className="text-slate-300 font-semibold">{rel.to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
