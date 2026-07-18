"use client";

import React, { useState, useEffect } from "react";
import { ListChecks, Check, X, ShieldAlert, Clock, User, Clipboard, Info, AlertTriangle, Loader2 } from "lucide-react";

interface Draft {
  draft_id: string;
  org_id: string;
  author_agent: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ReviewQueueView() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${KONG_URL}/api/v1/governance/drafts?status=PENDING`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to load drafts queue.");
      const data = await res.json();
      setDrafts(data);
      if (data.length > 0) {
        setSelectedDraft(data[0]);
      } else {
        setSelectedDraft(null);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision: "APPROVED" | "REJECTED") => {
    if (!selectedDraft || reviewing) return;
    try {
      setReviewing(true);
      const res = await fetch("/api/governance/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draft_id: selectedDraft.draft_id,
          reviewer_id: "human-supervisor",
          decision,
          comments
        })
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Failed to submit review decision.");
      }
      setComments("");
      await fetchDrafts();
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setReviewing(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  return (
    <div className="flex h-full bg-background overflow-hidden relative select-none">
      {/* Sidebar List */}
      <div className="w-80 border-r border-border flex flex-col h-full bg-card/20 shrink-0">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
            <ListChecks className="w-4 h-4 text-primary" />
            <span>Pending Review Queue</span>
          </h2>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {drafts.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-32 text-xs text-muted-foreground font-mono space-y-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span>Loading drafts...</span>
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground text-center font-sans">
              <Info className="w-6 h-6 text-border" />
              <p className="text-xs">No pending approvals.</p>
              <p className="text-[10px] text-slate-500">System is fully verified.</p>
            </div>
          ) : (
            drafts.map((d) => (
              <button
                key={d.draft_id}
                onClick={() => {
                  setSelectedDraft(d);
                  setComments("");
                }}
                className={`w-full flex flex-col text-left p-3 rounded transition-all border ${
                  selectedDraft?.draft_id === d.draft_id
                    ? "bg-muted/80 border-border text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span className="text-xs font-mono font-bold text-slate-300 truncate">{d.draft_id}</span>
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1.5 w-full">
                  <span className="uppercase tracking-wider">{d.org_id}</span>
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col h-full bg-[#070a10]">
        {selectedDraft ? (
          <div className="flex-1 flex flex-col h-full p-6 space-y-4 overflow-y-auto">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold text-primary font-mono uppercase tracking-widest">Grounded AI Draft</span>
                <h1 className="text-base font-bold text-slate-200 mt-1 font-mono">{selectedDraft.draft_id}</h1>
                <div className="flex items-center space-x-4 text-[10px] text-muted-foreground font-mono mt-2">
                  <span className="flex items-center space-x-1"><User className="w-3 h-3 text-slate-500" /> <span>Agent: <span className="text-slate-300">{selectedDraft.author_agent}</span></span></span>
                  <span>•</span>
                  <span className="flex items-center space-x-1"><Clipboard className="w-3 h-3 text-slate-500" /> <span>Tenant: <span className="text-slate-300 uppercase">{selectedDraft.org_id}</span></span></span>
                  <span>•</span>
                  <span className="flex items-center space-x-1"><Clock className="w-3 h-3 text-slate-500" /> <span>Date: <span className="text-slate-300">{new Date(selectedDraft.created_at).toLocaleTimeString()}</span></span></span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReview("REJECTED")}
                  disabled={reviewing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-950/40 text-xs font-bold uppercase rounded transition-all cursor-pointer font-sans disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleReview("APPROVED")}
                  disabled={reviewing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/40 text-xs font-bold uppercase rounded transition-all cursor-pointer font-sans disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              </div>
            </div>

            {/* Document contents editor (read-only comparison for supervisor review) */}
            <div className="flex-1 flex flex-col bg-card border border-border rounded-lg p-5 overflow-y-auto space-y-3 font-sans text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Proposed Output Text</span>
              <p className="text-slate-200 leading-relaxed font-mono whitespace-pre-wrap select-text">{selectedDraft.content}</p>
            </div>

            {/* Supervisor Comments Panel */}
            <div className="space-y-2">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Supervisor Review Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter approval details, correction demands, or citation comments..."
                className="w-full bg-card text-xs font-sans text-slate-200 border border-border rounded-lg p-3 outline-none resize-none focus:ring-1 focus:ring-primary placeholder:text-slate-500 h-20"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <ShieldAlert className="w-10 h-10 text-slate-800" />
            <span className="text-xs font-mono uppercase tracking-wider">Select a pending draft to initiate review</span>
          </div>
        )}
      </div>
    </div>
  );
}
