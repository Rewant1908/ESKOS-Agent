"use client";

import React, { useState, useEffect } from "react";
import { Layers, Loader2, Search, Cpu, Database, Eye, Info, RefreshCw, BarChart2 } from "lucide-react";

interface DocumentAsset {
  doc_id: string;
  document_name: string;
  document_type: string;
}

interface Chunk {
  chunk_id: string;
  parent_doc_id: string;
  chunk_type: string;
  position: number;
  entities: string[];
  trust_score: number;
  version: string;
  text: string;
  embedding_id: string;
}

interface EmbeddingDetail {
  chunk_id: string;
  collection: string;
  dimension: number;
  vector: number[];
}

export default function ChunkView() {
  const [documents, setDocuments] = useState<DocumentAsset[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingChunks, setLoadingChunks] = useState(false);
  
  // Selection
  const [selectedChunk, setSelectedChunk] = useState<Chunk | null>(null);
  const [embedding, setEmbedding] = useState<EmbeddingDetail | null>(null);
  const [loadingVector, setLoadingVector] = useState(false);

  // Search & Filter
  const [docSearch, setDocSearch] = useState("");
  const [chunkSearch, setChunkSearch] = useState("");

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/documents`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to load documents registry.");
      const data = await res.json();
      setDocuments(data);
      if (data.length > 0) {
        setSelectedDocId(data[0].doc_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchChunksForDoc = async (docId: string) => {
    if (!docId) return;
    try {
      setLoadingChunks(true);
      setSelectedChunk(null);
      setEmbedding(null);
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/document/${encodeURIComponent(docId)}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to load document segments.");
      const data = await res.json();
      setChunks(data.chunks || []);
      
      // Auto-select first chunk for inspection
      if (data.chunks && data.chunks.length > 0) {
        setSelectedChunk(data.chunks[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const fetchEmbeddingVector = async (chunkId: string) => {
    if (!chunkId) return;
    try {
      setLoadingVector(true);
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/embeddings/${encodeURIComponent(chunkId)}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to retrieve embeddings.");
      const data = await res.json();
      setEmbedding(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVector(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      fetchChunksForDoc(selectedDocId);
    }
  }, [selectedDocId]);

  useEffect(() => {
    if (selectedChunk) {
      fetchEmbeddingVector(selectedChunk.chunk_id);
    }
  }, [selectedChunk]);

  // Filters
  const filteredDocs = documents.filter(d => 
    d.document_name.toLowerCase().includes(docSearch.toLowerCase()) || 
    d.doc_id.toLowerCase().includes(docSearch.toLowerCase())
  );

  const filteredChunks = chunks.filter(c => 
    c.text.toLowerCase().includes(chunkSearch.toLowerCase()) || 
    c.entities.some(e => e.toLowerCase().includes(chunkSearch.toLowerCase()))
  );

  // Math helper for average chunk length
  const avgChunkLength = chunks.length > 0
    ? Math.round(chunks.reduce((sum, c) => sum + c.text.length, 0) / chunks.length)
    : 0;

  // Determine block color for vector heatmaps
  const getVectorColor = (val: number) => {
    if (val > 0) {
      // Scale green/blue
      const opacity = Math.min(1.0, val * 2);
      return `rgba(59, 130, 246, ${opacity})`; // blue
    } else {
      // Scale orange/red
      const opacity = Math.min(1.0, Math.abs(val) * 2);
      return `rgba(239, 68, 68, ${opacity})`; // red
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Chunk & Embedding Explorer</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Inspect document segmentation structures, semantic chunks, and vector embeddings in the RAG indexes.
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Document Selector Column (Left - 1/4 width) */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-2.5">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Asset Registry</h3>
          </div>

          <div className="flex items-center bg-background border border-border px-2.5 py-1.5 rounded space-x-2 text-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search document registry..."
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-200 placeholder:text-muted-foreground text-[10px]"
            />
          </div>

          {loadingDocs ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.doc_id}
                  onClick={() => setSelectedDocId(doc.doc_id)}
                  className={`w-full text-left p-2.5 rounded text-xs transition-all font-sans cursor-pointer block border ${
                    selectedDocId === doc.doc_id
                      ? "bg-slate-850 border-primary/50 text-slate-100"
                      : "bg-transparent border-transparent hover:bg-muted/10 text-muted-foreground hover:text-slate-350"
                  }`}
                >
                  <p className="font-semibold truncate">{doc.document_name}</p>
                  <span className="text-[9px] font-mono text-muted-foreground block mt-1 uppercase">
                    {doc.document_type.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
              {filteredDocs.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-6">No matching documents.</p>
              )}
            </div>
          )}
        </div>

        {/* Chunks List Column (Center - 2/4 width) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                  Document Segments
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-mono text-muted-foreground">
                <span>Segments: {chunks.length}</span>
                <span>Avg Size: {avgChunkLength} Chars</span>
              </div>
            </div>

            {/* Chunk Search */}
            <div className="flex items-center bg-background border border-border px-3 py-1.5 rounded space-x-2 text-xs">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter segments by text contents or extracted entities..."
                value={chunkSearch}
                onChange={e => setChunkSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-200 placeholder:text-muted-foreground text-xs"
              />
            </div>

            {/* Chunks List */}
            {loadingChunks ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-[9px] font-mono text-muted-foreground uppercase">Parsing Document Segments...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredChunks.map((chunk) => {
                  const isSelected = selectedChunk?.chunk_id === chunk.chunk_id;
                  return (
                    <div
                      key={chunk.chunk_id}
                      onClick={() => setSelectedChunk(chunk)}
                      className={`p-4 rounded border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? "bg-slate-800/30 border-primary"
                          : "bg-muted/10 border-border hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex justify-between items-center font-mono text-[9px] text-muted-foreground">
                        <span className="flex items-center space-x-1.5 text-primary font-bold">
                          <Layers className="w-3.5 h-3.5" />
                          <span>POSITION: {chunk.position}</span>
                        </span>
                        <span className="bg-slate-800 border border-border px-2 py-0.5 rounded font-mono">
                          {chunk.text.length} chars
                        </span>
                      </div>

                      <p className="text-slate-350 text-xs leading-relaxed font-sans select-text">
                        {chunk.text}
                      </p>

                      {chunk.entities && chunk.entities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {chunk.entities.map((ent, i) => (
                            <span
                              key={i}
                              className="bg-primary/5 border border-primary/20 text-primary px-2 py-0.5 rounded text-[8px] font-mono"
                            >
                              {ent}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredChunks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-12">
                    No segments index mapped for this asset.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vector Inspector Column (Right - 1/4 width) */}
        <div className="space-y-6">
          {selectedChunk && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4 font-sans text-xs">
              <div className="flex items-center space-x-2 border-b border-border pb-3">
                <Cpu className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                  Vector Inspector
                </h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] text-muted-foreground font-mono">CHUNK IDENTIFIER</span>
                  <p className="font-mono text-slate-200 font-bold break-all mt-0.5">{selectedChunk.chunk_id}</p>
                </div>

                <div>
                  <span className="text-[9px] text-muted-foreground font-mono">EMBEDDING COLLECTION</span>
                  <p className="text-slate-300 font-sans font-medium capitalize mt-0.5">
                    {embedding ? embedding.collection : "..."}
                  </p>
                </div>

                {/* Heatmap Matrix visualizer */}
                <div>
                  <span className="text-[9px] text-muted-foreground font-mono block mb-2">
                    VECTOR EMBEDDING HEATMAP (24 DIMENSIONS)
                  </span>
                  
                  {loadingVector ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  ) : embedding ? (
                    <div className="space-y-3">
                      {/* Grid representation */}
                      <div className="grid grid-cols-6 gap-1 bg-background/50 border border-border p-2 rounded justify-items-center">
                        {embedding.vector.map((val, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded flex items-center justify-center text-[7px] font-mono font-bold text-white relative group"
                            style={{ backgroundColor: getVectorColor(val) }}
                          >
                            {val > 0 ? "+" : "-"}
                            
                            {/* Hover tooltip for float value */}
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-slate-200 border border-border rounded px-1.5 py-0.5 text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-all pointer-events-none mb-1 z-30 shadow-md">
                              Dim {idx + 1}: {val}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Dimension metrics */}
                      <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <BarChart2 className="w-3.5 h-3.5 text-primary" />
                          <span>VEC DIM: {embedding.dimension}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>&gt; 0</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            <span>&lt; 0</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">Embedding details offline.</p>
                  )}
                </div>

                <div className="pt-3 border-t border-border/60">
                  <span className="text-[9px] text-muted-foreground font-mono">QDRANT UUID KEY</span>
                  <p className="font-mono text-slate-400 text-[10px] break-all select-text mt-0.5">
                    {selectedChunk.embedding_id || "null_vector_pointer"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">Embedding Indexing</span>
            <p className="text-muted-foreground leading-relaxed">
              Whenever documents are committed to ESKOS, chunks are vectorized using Gemini embeddings (768 dimensions) and indexed in **Qdrant** collections based on document classification types.
            </p>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded flex items-start space-x-2 text-[10px] text-primary">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Vector coordinates map high-dimensional semantic definitions to enable cosine-similarity matches.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
