"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Network, Cpu, ShieldCheck } from "lucide-react";

const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";

const KNOWN_DOCS = [
  'goel-allihn-condenser-300',
  'aspirator_bottles',
  'bell_jar',
  'coil_condenser',
  'desiccators',
  'extractors',
  'glass_beaker',
  'glass_flask',
  'goel-liebig-condenser-250',
  'micro_filteration_assembly',
];

interface Document {
  doc_id: string;
  document_name: string;
  document_type: string;
  product_category?: string;
  material?: string;
  applications?: string[];
  trust_score?: number;
  version?: string;
  extracted_text?: string;
}

export default function ExplorerView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Document[]>([]);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const fetched = await Promise.all(
          KNOWN_DOCS.map(id =>
            fetch(`${KONG_URL}/api/v1/knowledge/document/${id}`, {
              headers: { 'ngrok-skip-browser-warning': 'true' }
            })
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        );
        const docs = fetched.filter(Boolean);
        setAllDocs(docs);
        setResults(docs);
        if (docs.length > 0) setSelectedDoc(docs[0]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) {
      setResults(allDocs);
      return;
    }
    setLoading(true);
    try {
      const activeTenant = typeof window !== "undefined"
        ? localStorage.getItem("eskos-active-tenant") || "goel-scientific"
        : "goel-scientific";

      const res = await fetch(`${KONG_URL}/api/v1/knowledge/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ query, org_id: activeTenant, rag_type: 'product', limit: 10 }),
      });
      const data = await res.json();
      const hits = data.vector_hits || [];
      const docIds: string[] = [...new Set(hits.map((h: any) => h.parent_doc_id)) as any];
      
      if (docIds.length > 0) {
        const docs = await Promise.all(
          docIds.map(id => fetch(`${KONG_URL}/api/v1/knowledge/document/${id}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }).then(r => r.ok ? r.json() : null).catch(() => null))
        );
        const validDocs = docs.filter(Boolean);
        setResults(validDocs);
        if (validDocs.length > 0) setSelectedDoc(validDocs[0]);
      } else {
        const q = query.toLowerCase();
        const filtered = allDocs.filter(d =>
          (d.document_name || '').toLowerCase().includes(q) ||
          (d.material || '').toLowerCase().includes(q) ||
          (d.applications || []).some(a => a.toLowerCase().includes(q))
        );
        setResults(filtered);
        if (filtered.length > 0) setSelectedDoc(filtered[0]);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-full bg-background overflow-hidden relative select-none">
      {/* Left List Pane */}
      <div className="w-96 border-r border-border flex flex-col h-full bg-card/20">
        {/* Search Header */}
        <div className="p-4 border-b border-border space-y-3">
          <form onSubmit={handleSearch} className="flex items-center space-x-2 border border-border bg-background rounded-lg px-2.5 py-1.5 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search product metadata..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground font-sans"
            />
          </form>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="flex justify-center items-center h-32 text-xs text-muted-foreground font-mono">LOADING CATALOG...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground font-sans">No matching documents found.</div>
          ) : (
            results.map((doc) => (
              <button
                key={doc.doc_id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full flex flex-col items-start text-left p-3 rounded-md transition-all border ${
                  selectedDoc?.doc_id === doc.doc_id
                    ? "bg-muted/80 border-border text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-bold text-primary font-mono uppercase truncate max-w-[70%]">
                    {doc.product_category || doc.document_type || "Document"}
                  </span>
                  <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-muted-foreground">v{doc.version || "1.0"}</span>
                </div>
                <span className="text-xs text-slate-200 mt-1.5 font-sans truncate w-full">{doc.document_name || doc.doc_id}</span>
                {doc.material && (
                  <span className="text-[10px] text-muted-foreground mt-1 font-sans">{doc.material}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Details Pane */}
      <div className="flex-1 flex flex-col h-full bg-[#070a10] overflow-y-auto">
        {selectedDoc ? (
          <div className="p-8 space-y-6 max-w-3xl select-text">
            {/* Title / Action bar */}
            <div className="flex justify-between items-start border-b border-border pb-6 select-none">
              <div className="space-y-2">
                <span className="text-xs font-bold text-primary uppercase font-mono tracking-widest">
                  {selectedDoc.document_type}
                </span>
                <h1 className="text-xl font-bold text-slate-100 font-sans tracking-wide">
                  {selectedDoc.document_name}
                </h1>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground font-mono mt-1">
                  <span>ID: {selectedDoc.doc_id}</span>
                  <span>&middot;</span>
                  <div className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Trust score: {selectedDoc.trust_score || 100}</span>
                  </div>
                </div>
              </div>

              {/* Utility action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/knowledge/graph?entity=doc:${selectedDoc.doc_id}`)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
                >
                  <Network className="w-3.5 h-3.5 text-primary" />
                  <span>Graph View</span>
                </button>
                <button
                  onClick={() => router.push(`/agent/chat?q=Tell me about the ${selectedDoc.document_name}`)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>

            {/* Spec Attributes */}
            <div className="grid grid-cols-2 gap-4 select-none">
              <div className="bg-card/40 border border-border p-4 rounded-lg">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Structural Material</span>
                <p className="text-xs text-slate-200 mt-1 font-sans">{selectedDoc.material || "Borosilicate Glass 3.3"}</p>
              </div>
              <div className="bg-card/40 border border-border p-4 rounded-lg">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Document Version</span>
                <p className="text-xs text-slate-200 mt-1 font-mono">v{selectedDoc.version || "1.0"}</p>
              </div>
            </div>

            {/* Ingress Content text */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono select-none">Authoritative Text</span>
              <div className="border border-border bg-card/20 rounded-lg p-5 leading-relaxed text-xs text-slate-300 font-sans max-h-96 overflow-y-auto whitespace-pre-wrap">
                {selectedDoc.extracted_text || "No text content cataloged."}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-muted-foreground select-none">
            <FileText className="w-10 h-10 text-slate-800" />
            <span className="text-xs font-mono uppercase tracking-wider">Select a document to inspect details</span>
          </div>
        )}
      </div>
    </div>
  );
}
