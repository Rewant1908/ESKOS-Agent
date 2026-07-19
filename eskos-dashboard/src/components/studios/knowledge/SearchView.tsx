"use client";

import React, { useState } from "react";
import { SearchCode, Layers, Network } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";

interface Hit {
  parent_doc_id: string;
  score: number;
  text: string;
}

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ vectorHits: Hit[]; graphContext: string }>({
    vectorHits: [],
    graphContext: "",
  });

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const activeTenant = typeof window !== "undefined"
        ? localStorage.getItem("eskos-active-tenant") || "goel-scientific"
        : "goel-scientific";

      const res = await fetch(`${KONG_URL}/api/v1/knowledge/context`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ query, org_id: activeTenant, rag_type: "product", limit: 5 }),
      });
      const data = await res.json();

      let formattedGraphStr = "";
      if (data.graph_context && typeof data.graph_context === "object") {
        const parts: string[] = [];
        for (const [docId, neighbors] of Object.entries(data.graph_context)) {
          if (Array.isArray(neighbors) && neighbors.length > 0) {
            parts.push(`Document: ${docId}`);
            neighbors.forEach((n: any) => {
              parts.push(`  • --[${n.relationship || "RELATED_TO"}]--> ${n.name || n.id || ""} (${n.id || ""})`);
            });
            parts.push("");
          }
        }
        formattedGraphStr = parts.join("\n").trim();
      }

      setResults({
        vectorHits: data.vector_hits || [],
        graphContext: formattedGraphStr || "",
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide font-sans">Search Studio</h1>
          <DataStateBadge state="live" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Compare search routes, dense vector match scoring, and query performance context side-by-side.</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleTestSearch} className="flex items-center space-x-3 max-w-4xl border border-border rounded-lg bg-card p-2.5 shadow-sm select-none">
        <SearchCode className="w-5 h-5 text-primary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a test query to verify dense vector vs graph retrieval matching..."
          className="flex-1 bg-transparent text-sm text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground font-sans py-1"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center justify-center px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs uppercase font-bold tracking-wider hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer font-sans"
        >
          {loading ? "Testing..." : "Test Search"}
        </button>
      </form>

      {/* Results Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Vector Hits Panel */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col space-y-4 h-[400px] overflow-y-auto">
          <div className="flex items-center space-x-2 border-b border-border pb-3 select-none">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Dense Vector Matches (Qdrant)</h3>
          </div>
          
          <div className="space-y-3 font-mono text-[10px]">
            {results.vectorHits.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-sans select-none">Submit a query to inspect vector embeddings.</div>
            ) : (
              results.vectorHits.map((hit, idx) => (
                <div key={idx} className="p-3 rounded bg-muted/20 border border-border space-y-1.5 select-text">
                  <div className="flex justify-between items-center text-muted-foreground font-semibold select-none">
                    <span className="text-primary uppercase font-mono">doc: {hit.parent_doc_id}</span>
                    <span>Similarity: {(hit.score * 100).toFixed(2)}%</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans text-xs">{hit.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Graph Context Panel */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col space-y-4 h-[400px] overflow-y-auto">
          <div className="flex items-center space-x-2 border-b border-border pb-3 select-none">
            <Network className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Knowledge Graph Context (Neo4j)</h3>
          </div>

          <div className="flex-1 font-mono text-xs text-slate-300 leading-relaxed">
            {!results.graphContext ? (
              <div className="text-center py-20 text-muted-foreground font-sans select-none">Submit a query to inspect structural graph adjacencies.</div>
            ) : (
              <div className="p-4 rounded bg-muted/20 border border-border whitespace-pre-wrap select-text h-full overflow-y-auto font-sans text-xs">
                {results.graphContext}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
