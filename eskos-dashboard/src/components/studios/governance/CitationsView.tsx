"use client";

import React, { useState } from "react";
import { FileSearch, CheckCircle2, AlertTriangle, ExternalLink, Bookmark, HelpCircle, ShieldAlert, Award } from "lucide-react";

interface Citation {
  quote: string;
  sourceDocId: string;
  sourceTitle: string;
  credibilityScore: number;
  matchScore: number;
}

const SEED_CITATIONS: Citation[] = [
  { quote: "Goel Scientific high pressure reactors operate safely up to 250°C and 10 bar pressure.", sourceDocId: "doc-goel-01", sourceTitle: "Goel Scientific Industrial Reactors Specifications", credibilityScore: 94.5, matchScore: 98.2 },
  { quote: "All glassware is manufactured utilizing premium heat-resistant borosilicate 3.3 glass.", sourceDocId: "doc-goel-02", sourceTitle: "Glassware Technical Process Standards Guide", credibilityScore: 91.0, matchScore: 95.5 }
];

export default function CitationsView() {
  const [citations, setCitations] = useState<Citation[]>(SEED_CITATIONS);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(SEED_CITATIONS[0]);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Citation Viewer</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Verify citations, text grounding matches, and source credibility rankings for published knowledge documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[450px]">
        {/* Left/Center: Citations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
              <Bookmark className="w-3.5 h-3.5 text-primary" />
              <span>Grounded Claims Checklist</span>
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Every statement in the generated document must be grounded in an verified source documentation. Pasted below are claims parsed from active draft-72b1cc.
            </p>
          </div>

          <div className="space-y-3">
            {citations.map((c, idx) => {
              const isSelected = selectedCitation?.sourceDocId === c.sourceDocId;
              return (
                <div
                  key={c.sourceDocId}
                  onClick={() => setSelectedCitation(c)}
                  className={`bg-card border p-4 rounded-lg cursor-pointer transition-all flex flex-col space-y-3 font-sans text-xs ${
                    isSelected ? "border-primary" : "border-border hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Claim {idx + 1}</span>
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>GROUNDED</span>
                    </span>
                  </div>
                  <p className="text-slate-200 italic leading-relaxed font-mono">
                    "{c.quote}"
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-border/40 pt-2.5">
                    <span>Source Doc: <span className="text-slate-400 font-semibold">{c.sourceDocId}</span></span>
                    <span>Confidence Match: <span className="text-primary font-semibold">{c.matchScore}%</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Source Detail Inspector */}
        <div className="lg:col-span-1 border border-border bg-card/30 p-5 rounded-lg flex flex-col space-y-4">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-primary" />
            <span>Citation Authority Inspector</span>
          </span>

          {selectedCitation ? (
            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-slate-300 font-semibold text-[11px] uppercase tracking-wider">Grounded Document</span>
                <div className="text-slate-200 font-mono font-bold mt-1.5 flex items-center space-x-1.5">
                  <span>{selectedCitation.sourceTitle}</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Source ID</span>
                <div className="text-slate-400 font-mono">{selectedCitation.sourceDocId}</div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Source Credibility Index</span>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-background h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${selectedCitation.credibilityScore}%` }}
                    />
                  </div>
                  <span className="font-mono text-emerald-400 font-bold text-[10px] shrink-0">
                    {selectedCitation.credibilityScore}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Traceability Verification</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-bold font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>AUDITED GROUNDING</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground text-xs font-sans text-center">
              <ShieldAlert className="w-6 h-6 text-border" />
              <p>Select a grounded claim card to inspect source authority details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
