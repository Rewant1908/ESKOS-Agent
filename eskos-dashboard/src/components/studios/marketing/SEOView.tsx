"use client";

import React, { useState } from "react";
import { Activity, Search, Sparkles, RefreshCw, AlertTriangle, FileText, CheckCircle2, Loader2, Award } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface SEOResponse {
  seo_score: number;
  keyword_density: number;
  word_count: number;
  keyword_hits: Record<string, number>;
}

export default function SEOView() {
  const [content, setContent] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("glassware, reactors, borosilicate, pressure");
  const [result, setResult] = useState<SEOResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const analyzeSEO = async () => {
    if (!content.trim()) {
      setError("Please enter some document content to analyze.");
      return;
    }
    const keywords = keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) {
      setError("Please enter at least one target keyword.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${KONG_URL}/api/v1/metrics/seo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ content, keywords })
      });
      if (!res.ok) throw new Error("Failed to retrieve SEO evaluation metrics.");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">SEO Intelligence</h1>
          <DataStateBadge state="live" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Analyze keyword density, word distributions, and search engine optimization parameters for your scientific pages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Column (Left) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-3">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Document SEO Auditor</span>
            </span>

            {/* Target Keywords Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Target Keywords (Comma Separated)</label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="e.g. reactors, borosilicate, glass"
                className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans"
              />
            </div>

            {/* Content text area */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Page Content Text</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the page contents here to check keyword density and readability parameters..."
                className="w-full h-80 bg-background text-xs font-mono text-slate-200 border border-border rounded-lg p-4 outline-none resize-none focus:ring-1 focus:ring-primary placeholder:text-slate-600 select-text"
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                onClick={analyzeSEO}
                disabled={loading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                <span>Run SEO Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Column (Right) */}
        <div className="lg:col-span-1 space-y-4">
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-start space-x-3 text-red-400 font-sans text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              {/* Score card */}
              <div className="bg-card border border-border p-5 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SEO Quality Rating</span>
                <div className="relative w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <div className="text-xl font-bold font-mono text-slate-100">{result.seo_score}%</div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                  result.seo_score >= 80
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : result.seo_score >= 50
                    ? "border-amber-500/20 text-amber-400 bg-amber-500/5"
                    : "border-red-500/20 text-red-400 bg-red-500/5"
                }`}>
                  {result.seo_score >= 80 ? "EXCELLENT DENSITY" : result.seo_score >= 50 ? "MODERATE DENSITY" : "POOR DENSITY"}
                </span>
              </div>

              {/* Stats card */}
              <div className="bg-card border border-border p-5 rounded-lg space-y-3 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-2">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>Telemetry Indicators</span>
                </span>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Word Count:</span>
                  <span className="font-mono text-slate-200 font-bold">{result.word_count} words</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Keyword Density:</span>
                  <span className="font-mono text-slate-200 font-bold">{(result.keyword_density * 100).toFixed(2)}%</span>
                </div>
              </div>

              {/* Keyword hits card */}
              <div className="bg-card border border-border p-5 rounded-lg space-y-3 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/60 pb-2">
                  <Search className="w-3.5 h-3.5 text-primary" />
                  <span>Keyword Hits Frequency</span>
                </span>
                <div className="divide-y divide-border/40 font-mono text-[11px]">
                  {Object.entries(result.keyword_hits).map(([kw, count]) => (
                    <div key={kw} className="flex justify-between items-center py-2 text-slate-300">
                      <span>{kw}</span>
                      <span className="font-bold text-primary">{count} matches</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center space-y-3 text-center min-h-[300px] text-muted-foreground font-sans">
              <Sparkles className="w-8 h-8 text-border animate-pulse mb-1" />
              <p className="text-xs">No analysis executed.</p>
              <p className="text-[10px] text-slate-500">Provide document text and click analyze to check SEO metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
