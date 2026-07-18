"use client";

import React from "react";
import { GitBranch, User, Calendar } from "lucide-react";

export default function VersionView() {
  const commits = [
    { hash: "8a6edae7", author: "rewant", date: "2026-07-18 06:05:43", message: "Seed database: added 10 scientific product specifications" },
    { hash: "f93c83e0", author: "rewant", date: "2026-07-18 05:46:02", message: "Initial platform bootstrap: imported core system ontology ontology models" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Version Control</h1>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Inspect the revision history of the knowledge graph and metadata registry configurations.</p>
      </div>

      <div className="space-y-4">
        {commits.map((commit) => (
          <div key={commit.hash} className="bg-card border border-border p-5 rounded-lg space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center select-none">
              <div className="flex items-center space-x-2 text-primary font-bold">
                <GitBranch className="w-4 h-4" />
                <span>commit {commit.hash}</span>
              </div>
              <div className="flex items-center space-x-4 text-muted-foreground text-[10px]">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{commit.author}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{commit.date}</span>
                </span>
              </div>
            </div>
            <p className="text-slate-300 font-sans select-text">{commit.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
