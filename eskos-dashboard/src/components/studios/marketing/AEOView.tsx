"use client";

import React, { useState } from "react";
import { Compass, Sparkles, AlertTriangle, FileText, CheckCircle2, Loader2, Award, SearchCode } from "lucide-react";

interface AEOResults {
  score: number;
  featuredSnippetScore: number;
  schemaGroundingScore: number;
  directAnswerScore: number;
  suggestions: string[];
}

export default function AEOView() {
  const [content, setContent] = useState("");
  const [results, setResults] = useState<AEOResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runAEOAnalysis = () => {
    if (!content.trim()) return;
    setLoading(true);
    setTimeout(() => {
      // Simulate AEO evaluation rules
      const wordCount = content.split(/\s+/).length;
      const questionCount = (content.match(/\?\s/g) || []).length;
      const jsonLdCount = (content.match(/application\/ld\+json/g) || []).length;
      const faqCount = (content.match(/faq|frequently asked questions/i) || []).length;
      
      const schema = jsonLdCount > 0 ? 100 : 35;
      const direct = Math.min(100, (questionCount * 25 + 40));
      const snippet = Math.min(100, (faqCount * 30 + 50));

      const finalScore = Math.round((schema * 0.3 + direct * 0.4 + snippet * 0.3));

      const suggestions: string[] = [];
      if (jsonLdCount === 0) suggestions.push("Embed script tags of type application/ld+json for Structured FAQ Schemas.");
      if (questionCount === 0) suggestions.push("Structure headers in standard Q&A format (e.g. 'How does X operate?') to target Featured Snippets.");
      if (faqCount === 0) suggestions.push("Create a designated 'Frequently Asked Questions' section to improve voice search ranking.");

      setResults({
        score: finalScore,
        schemaGroundingScore: schema,
        directAnswerScore: direct,
        featuredSnippetScore: snippet,
        suggestions: suggestions.length > 0 ? suggestions : ["Content is highly optimized for Answer Engine featured queries!"]
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">AEO Intelligence</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Audit and optimize product documentation to target featured snippets, direct answer cards, and voice search queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-3">
              <SearchCode className="w-3.5 h-3.5 text-primary" />
              <span>Answer Engine Optimizer</span>
            </span>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Proposed Page Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the page contents here to check Q&A structures, FAQ schema script tags, and Featured Snippet parameters..."
                className="w-full h-80 bg-background text-xs font-mono text-slate-200 border border-border rounded-lg p-4 outline-none resize-none focus:ring-1 focus:ring-primary placeholder:text-slate-600 select-text"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={runAEOAnalysis}
                disabled={loading || !content.trim()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
                <span>Run AEO Audit</span>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">AEO Snippet Rating</span>
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
                  {results.score >= 80 ? "SNIPPET ELIGIBLE" : results.score >= 50 ? "MODERATE QUALITY" : "REQUIRES OPTIMIZATION"}
                </span>
              </div>

              {/* Breakdown metrics */}
              <div className="bg-card border border-border p-5 rounded-lg space-y-4 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-2">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>AEO Telemetry</span>
                </span>
                
                {/* Direct Answer */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px]">
                    <span className="text-slate-400">Direct Answer Score</span>
                    <span className="text-slate-200 font-bold">{results.directAnswerScore}%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${results.directAnswerScore}%` }} />
                  </div>
                </div>

                {/* Schema Grounding */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px]">
                    <span className="text-slate-400">Schema Grounding Score</span>
                    <span className="text-slate-200 font-bold">{results.schemaGroundingScore}%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${results.schemaGroundingScore}%` }} />
                  </div>
                </div>

                {/* Featured Snippet */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px]">
                    <span className="text-slate-400">Featured Snippet Rating</span>
                    <span className="text-slate-200 font-bold">{results.featuredSnippetScore}%</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${results.featuredSnippetScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-card border border-border p-5 rounded-lg space-y-3 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>AEO Improvement Recommendations</span>
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
              <p className="text-[10px] text-slate-500">Provide document text and click optimize to audit AEO parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
