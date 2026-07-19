"use client";

import React, { useState } from "react";
import { Compass, Sparkles, AlertTriangle, FileText, CheckCircle2, Loader2, Award, Brain } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface GEOResults {
  score: number;
  readabilityIndex: number;
  structuredDataScore: number;
  referenceGroundingScore: number;
  suggestions: string[];
}

export default function GEOView() {
  const [content, setContent] = useState("");
  const [results, setResults] = useState<GEOResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runGEOAnalysis = () => {
    if (!content.trim()) return;
    setLoading(true);
    setTimeout(() => {
      // Simulate GEO evaluation rules
      const wordCount = content.split(/\s+/).length;
      const listCount = (content.match(/-\s/g) || []).length;
      const tableCount = (content.match(/\|/g) || []).length;
      const citationCount = (content.match(/doc-\w+/g) || []).length;
      
      const structured = Math.min(100, (listCount * 15 + tableCount * 8 + 40));
      const references = Math.min(100, (citationCount * 25 + 30));
      const readability = wordCount > 100 ? 82.5 : 55.0;

      const finalScore = Math.round((structured * 0.4 + references * 0.4 + readability * 0.2));

      const suggestions: string[] = [];
      if (listCount === 0) suggestions.push("Add bullet points or steps to help generative models outline the topic.");
      if (tableCount === 0) suggestions.push("Add markdown tables to represent technical specification metrics clearly.");
      if (citationCount === 0) suggestions.push("Cite verification source document IDs (e.g. [doc-goel-01]) to establish reference authority.");

      setResults({
        score: finalScore,
        readabilityIndex: readability,
        structuredDataScore: structured,
        referenceGroundingScore: references,
        suggestions: suggestions.length > 0 ? suggestions : ["Content is highly optimized for AI answer synthesis!"]
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">GEO Intelligence</h1>
          <DataStateBadge state="simulated" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Audit and optimize technical content to maximize index accessibility and synthesis accuracy inside Generative AI Models (e.g. Gemini, ChatGPT).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-3">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span>Generative Model Content Optimizer</span>
            </span>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Proposed Page Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the page contents here to check readability indices, citation markers, structured data validation, and response clarity score..."
                className="w-full h-80 bg-background text-xs font-mono text-slate-200 border border-border rounded-lg p-4 outline-none resize-none focus:ring-1 focus:ring-primary placeholder:text-slate-600 select-text"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={runGEOAnalysis}
                disabled={loading || !content.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
                <span>Run GEO Audit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-1 space-y-4">
          {results ? (
            <div className="space-y-4">
              {/* Score card */}
              <div className="bg-card border border-border p-5 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">GEO Readability Score</span>
                <div className="relative w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <div className="text-xl font-bold font-mono text-slate-100">{results.score}%</div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                  results.score >= 80
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : results.score >= 50
                    ? "border-amber-500/20 text-amber-400 bg-amber-500/5"
                    : "border-red-500/20 text-red-400 bg-red-500/5"
                }`}>
                  {results.score >= 80 ? "LLM COMPATIBLE" : results.score >= 50 ? "MODERATE QUALITY" : "REQUIRES OPTIMIZATION"}
                </span>
              </div>

              {/* Breakdown metrics */}
              <div className="bg-card border border-border p-5 rounded-lg space-y-4 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-2">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>Optimization Telemetry</span>
                </span>
                
                {/* Structured Data */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px]">
                    <span className="text-slate-400">Structured Data Score</span>
                    <span className="text-slate-200 font-bold">{results.structuredDataScore}%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${results.structuredDataScore}%` }} />
                  </div>
                </div>

                {/* Reference Grounding */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px]">
                    <span className="text-slate-400">Reference Grounding Score</span>
                    <span className="text-slate-200 font-bold">{results.referenceGroundingScore}%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${results.referenceGroundingScore}%` }} />
                  </div>
                </div>

                {/* Readability */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px]">
                    <span className="text-slate-400">Readability Index</span>
                    <span className="text-slate-200 font-bold">{results.readabilityIndex}%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${results.readabilityIndex}%` }} />
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-card border border-border p-5 rounded-lg space-y-3 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>GEO Improvement Recommendations</span>
                </span>
                <ul className="space-y-2 text-slate-300 font-mono text-[10px] list-disc pl-4">
                  {results.suggestions.map((s, idx) => (
                    <li key={idx} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center space-y-3 text-center min-h-[300px] text-muted-foreground font-sans">
              <Sparkles className="w-8 h-8 text-border animate-pulse mb-1" />
              <p className="text-xs">No audit executed.</p>
              <p className="text-[10px] text-slate-500">Provide document text and click optimize to audit GEO parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
