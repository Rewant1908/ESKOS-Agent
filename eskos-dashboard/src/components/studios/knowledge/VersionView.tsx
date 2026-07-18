"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, User, Calendar, Loader2, RefreshCw, Eye, ArrowRight, ShieldCheck, FileSpreadsheet } from "lucide-react";

interface Commit {
  hash: string;
  doc_id: string;
  name: string;
  version: string;
  author: string;
  date: string;
  message: string;
  lineage: string[];
  parentDoc: string;
  trustScore: number;
}

export default function VersionView() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/knowledge/versions");
      if (!res.ok) throw new Error("Failed to load versions.");
      const data = await res.json();
      setCommits(data.commits || []);
      if (data.commits?.length > 0) {
        setSelectedCommit(data.commits[0]);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load version logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Version Control</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Inspect the revision history, parent lineages, and commit logs of the Knowledge Fabric database.
          </p>
        </div>
        <button
          onClick={fetchVersions}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Commits</span>
        </button>
      </div>

      {loading && commits.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Hydrating timeline logs...</span>
        </div>
      ) : error ? (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
          ⚠️ {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Commits Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-2 mb-2">
              <GitBranch className="w-3.5 h-3.5 text-primary" />
              <span>Commit Ledger</span>
            </span>

            <div className="relative border-l border-border/80 pl-6 ml-3 space-y-6">
              {commits.map((commit, idx) => {
                const isSelected = selectedCommit?.doc_id === commit.doc_id;
                return (
                  <div key={commit.doc_id} className="relative group">
                    
                    {/* Node Dot */}
                    <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                      isSelected 
                        ? "bg-primary border-primary scale-110 shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" 
                        : "bg-background border-border group-hover:border-primary/50"
                    }`} />

                    <div 
                      onClick={() => setSelectedCommit(commit)}
                      className={`bg-card/25 border p-4 rounded-lg cursor-pointer transition-all hover:bg-muted/10 ${
                        isSelected ? "border-primary" : "border-border/60"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-primary font-bold">commit {commit.hash}</span>
                          <span className="text-slate-500">v{commit.version}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{commit.author}</span>
                          </span>
                          <span className="flex items-center space-x-1 font-sans">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(commit.date).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">{commit.message}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Details Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {selectedCommit ? (
              <div className="border border-border p-5 rounded-lg bg-[#0b101d]/15 space-y-5">
                
                <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                  <span>Audit Detail ({selectedCommit.hash})</span>
                </span>

                <div className="space-y-4 text-xs font-sans">
                  
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Source Document ID</span>
                    <span className="font-mono text-slate-300 font-bold block mt-0.5">{selectedCommit.doc_id}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Document Name</span>
                    <span className="text-slate-200 font-medium block mt-0.5">{selectedCommit.name}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Original Parent</span>
                    <span className="text-slate-300 font-mono block mt-0.5">{selectedCommit.parentDoc}</span>
                  </div>

                  <div className="flex justify-between items-center bg-background border border-border p-2.5 rounded">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-mono uppercase text-slate-400">Trust Index Score</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {Math.round(selectedCommit.trustScore * 100)}%
                    </span>
                  </div>

                  {selectedCommit.lineage.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Provenance Lineage Trail</span>
                      <div className="space-y-1.5 pl-2 border-l-2 border-border/60">
                        {selectedCommit.lineage.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                            <span className="text-slate-600">[{sIdx + 1}]</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="border border-dashed border-border p-8 rounded-lg text-center text-xs text-muted-foreground uppercase tracking-wider font-mono">
                Select a commit log to view audit trace
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
