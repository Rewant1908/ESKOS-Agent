"use client";

import React, { useState, useEffect } from "react";
import { FileSearch, CheckCircle2, ShieldAlert, Bookmark, Award, Loader2, RefreshCw, Globe, ArrowUpRight } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface Citation {
  quote: string;
  sourceDocId: string;
  sourceTitle: string;
  credibilityScore: number;
  matchScore: number;
}

interface Referral {
  domain: string;
  sessions: number;
  conversions: number;
  trend: string;
}

export default function CitationsView() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/governance/citations");
      if (!res.ok) throw new Error("Failed to load citations metadata.");
      const data = await res.json();
      
      const claims: Citation[] = data.claims || [];
      setCitations(claims);
      setReferrals(data.referrals || []);
      if (claims.length > 0) {
        setSelectedCitation(claims[0]);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load citation analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitations();
  }, []);

  if (loading && citations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Querying citation grounding ledger...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Citation Viewer</h1>
            <DataStateBadge state="simulated" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Verify citations, text grounding matches, and source credibility rankings for published knowledge documents.
          </p>
        </div>
        <button
          onClick={fetchCitations}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Citations</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[350px]">
        {/* Left/Center: Citations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
              <Bookmark className="w-3.5 h-3.5 text-primary" />
              <span>Grounded Claims Checklist</span>
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Every statement in the generated document must be grounded in verified source documentation. Pasted below are claims parsed from active draft sessions.
            </p>
          </div>

          <div className="space-y-3">
            {citations.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border/60 rounded-xl text-muted-foreground text-xs">
                No citations found in knowledge fabric.
              </div>
            ) : (
              citations.map((c, idx) => {
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
              })
            )}
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
                <span className="span inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[9px] font-bold font-mono">
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

      {/* AI Referral Traffic Table (Phase D.2 Citation Intelligence) */}
      <div className="bg-card border border-border p-5 rounded-lg space-y-4">
        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>AI Search Assistant Citation Referral Traffic (Phase D.2)</span>
        </span>
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-card border-b border-border text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono font-bold">
                <th className="p-3">AI Engine Domain</th>
                <th className="p-3">Inbound Sessions</th>
                <th className="p-3">Grounding Conversions</th>
                <th className="p-3 text-right">Weekly Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-slate-300 font-mono text-[11px]">
              {referrals.map((ref) => (
                <tr key={ref.domain} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3 font-semibold text-slate-400 flex items-center space-x-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                    <span>{ref.domain}</span>
                  </td>
                  <td className="p-3 text-slate-300">{ref.sessions.toLocaleString()}</td>
                  <td className="p-3 text-slate-300">{ref.conversions.toLocaleString()}</td>
                  <td className={`p-3 text-right font-bold ${
                    ref.trend.startsWith("+") ? "text-emerald-400" : "text-rose-400"
                  }`}>{ref.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
