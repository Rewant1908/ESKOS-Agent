"use client";

import React, { useState, useEffect } from "react";
import { Binary, Plus, ShieldCheck, Edit, Trash2, Info, Loader2, AlertCircle, CheckCircle, Search, RefreshCw } from "lucide-react";

interface DocumentAsset {
  doc_id: string;
  org_id: string;
  document_name: string;
  document_type: string;
  product_category: string | null;
  product_family: string | null;
  material: string | null;
  industry: string | null;
  applications: string[];
  department: string | null;
  source_category: string;
  author: string | null;
  reviewer: string | null;
  version: string;
  revision_notes: string | null;
  approval_status: string;
  effective_date: string | null;
  expiry_date: string | null;
  language: string;
  entity_tags: string[];
  keywords: string[];
  trust_score: number;
  content_type: string;
  region: string | null;
}

export default function MetadataView() {
  const [documents, setDocuments] = useState<DocumentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection & Editing
  const [selectedDoc, setSelectedDoc] = useState<DocumentAsset | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DocumentAsset>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/documents`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to retrieve documents registry.");
      const data = await res.json();
      setDocuments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to establish connection to the Kong API Gateway.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSelectDoc = (doc: DocumentAsset) => {
    setSelectedDoc(doc);
    setEditForm(doc);
    setIsEditing(false);
    setValidationError(null);
    setSaveSuccess(false);
  };

  const handleInputChange = (field: keyof DocumentAsset, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleListInputChange = (field: "applications" | "keywords" | "entity_tags", valStr: string) => {
    const list = valStr.split(",").map(s => s.trim()).filter(Boolean);
    setEditForm(prev => ({
      ...prev,
      [field]: list
    }));
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setValidationError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/documents/${selectedDoc.doc_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update metadata asset.");
      }

      setSaveSuccess(true);
      setIsEditing(false);
      await fetchDocuments();
      
      // Update selected document references
      const updatedDoc = documents.find(d => d.doc_id === selectedDoc.doc_id);
      if (updatedDoc) {
        setSelectedDoc({ ...updatedDoc, ...editForm } as DocumentAsset);
      }
    } catch (err: any) {
      setValidationError(err.message);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm(`Are you sure you want to permanently delete document "${docId}" from the ESKOS registry? This will clean up all associated chunks in Qdrant and node relationships in Neo4j.`)) return;
    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/documents/${docId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete document from registry.");
      setSelectedDoc(null);
      await fetchDocuments();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filters
  const filteredDocs = documents.filter(d => {
    const nameMatch = d.document_name.toLowerCase().includes(searchQuery.toLowerCase()) || d.doc_id.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = typeFilter === "all" || d.document_type === typeFilter;
    return nameMatch && typeMatch;
  });

  const docTypes = Array.from(new Set(documents.map(d => d.document_type)));

  if (loading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Querying Knowledge Asset Registry...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Knowledge Asset Manager</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Validate metadata schemas, configure life-cycle approvals, and maintain ontology mapping.
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh DB</span>
        </button>
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Table Column (Left) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-card border border-border p-3 rounded-lg text-xs font-sans">
            <div className="flex-1 flex items-center bg-background border border-border px-3 py-1.5 rounded space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search document assets by name or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-200 text-xs placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground font-semibold">Filter:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-background border border-border p-1.5 rounded text-slate-200 outline-none focus:border-primary font-sans"
              >
                <option value="all">All Document Types</option>
                {docTypes.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[10px] text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground pb-2">
                    <th className="py-2.5 font-bold uppercase">Asset Name</th>
                    <th className="py-2.5 font-bold uppercase">Document Type</th>
                    <th className="py-2.5 font-bold uppercase">Material</th>
                    <th className="py-2.5 font-bold uppercase">Status</th>
                    <th className="py-2.5 font-bold uppercase">Trust Score</th>
                    <th className="py-2.5 font-bold uppercase text-right">Version</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.doc_id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`border-b border-border/40 hover:bg-muted/10 cursor-pointer ${
                        selectedDoc?.doc_id === doc.doc_id ? "bg-slate-800/20" : ""
                      }`}
                    >
                      <td className="py-3 font-semibold text-slate-200 max-w-xs truncate">
                        {doc.document_name}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {doc.document_type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 text-slate-300">
                        {doc.material || "â"}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-sans text-[8px] font-bold uppercase border ${
                          doc.approval_status === "approved"
                            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                        }`}>
                          {doc.approval_status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`font-bold ${
                          doc.trust_score >= 80 ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {doc.trust_score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400 font-bold">
                        v{doc.version}
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground font-sans">
                        No registered documents found matching parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Inspector Column (Right) */}
        <div className="space-y-6">
          
          {selectedDoc && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <Binary className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Asset Inspector</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary hover:text-primary/80 flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm(selectedDoc);
                        setValidationError(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Status messages */}
              {validationError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded flex items-start space-x-2 text-red-400 font-mono text-[10px]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{validationError}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded flex items-center space-x-2 text-emerald-400 text-[10px]">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Asset metadata updated and validated.</span>
                </div>
              )}

              {/* Inspector Content */}
              <form onSubmit={handleSaveMetadata} className="space-y-4">
                
                {/* Fixed read-only doc ID */}
                <div>
                  <span className="text-[9px] text-muted-foreground font-mono">ASSET ID</span>
                  <p className="font-mono text-slate-300 font-bold select-text mt-0.5">{selectedDoc.doc_id}</p>
                </div>

                {/* Document Name */}
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-foreground font-mono uppercase">Document Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={editForm.document_name || ""}
                      onChange={e => handleInputChange("document_name", e.target.value)}
                      className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary text-xs"
                    />
                  ) : (
                    <p className="text-slate-200 font-semibold select-text mt-0.5">{selectedDoc.document_name}</p>
                  )}
                </div>

                {/* Document Type & Material */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground font-mono uppercase">Document Type</label>
                    {isEditing ? (
                      <select
                        value={editForm.document_type || ""}
                        onChange={e => handleInputChange("document_type", e.target.value)}
                        className="w-full bg-background border border-border p-1.5 rounded text-slate-200 outline-none focus:border-primary text-xs"
                      >
                        <option value="product_datasheet">Product Datasheet</option>
                        <option value="scientific_paper">Scientific Paper</option>
                        <option value="sop">Safety SOP</option>
                        <option value="chemical_sds">Chemical SDS</option>
                      </select>
                    ) : (
                      <p className="text-slate-300 font-medium mt-0.5">{selectedDoc.document_type.replace(/_/g, " ")}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground font-mono uppercase">Material composition</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.material || ""}
                        onChange={e => handleInputChange("material", e.target.value)}
                        className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary text-xs"
                      />
                    ) : (
                      <p className="text-slate-300 font-medium mt-0.5">{selectedDoc.material || "â"}</p>
                    )}
                  </div>
                </div>

                {/* Version & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground font-mono uppercase">Version</label>
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={editForm.version || ""}
                        onChange={e => handleInputChange("version", e.target.value)}
                        className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary text-xs font-mono"
                      />
                    ) : (
                      <p className="text-slate-300 font-mono font-bold mt-0.5">v{selectedDoc.version}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground font-mono uppercase">Approval state</label>
                    {isEditing ? (
                      <select
                        value={editForm.approval_status || ""}
                        onChange={e => handleInputChange("approval_status", e.target.value)}
                        className="w-full bg-background border border-border p-1.5 rounded text-slate-200 outline-none focus:border-primary text-xs"
                      >
                        <option value="approved">Approved</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="archived">Archived</option>
                      </select>
                    ) : (
                      <p className="text-slate-300 font-medium mt-0.5 capitalize">{selectedDoc.approval_status}</p>
                    )}
                  </div>
                </div>

                {/* Applications list */}
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-foreground font-mono uppercase">Applications (Comma separated)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.applications?.join(", ") || ""}
                      onChange={e => handleListInputChange("applications", e.target.value)}
                      className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary text-xs"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1 select-text">
                      {selectedDoc.applications.map(app => (
                        <span key={app} className="bg-muted/30 border border-border px-2 py-0.5 rounded text-[8px] font-mono text-slate-300">
                          {app}
                        </span>
                      ))}
                      {selectedDoc.applications.length === 0 && <span className="text-[10px] text-muted-foreground">â</span>}
                    </div>
                  )}
                </div>

                {/* Entity tags */}
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-foreground font-mono uppercase">Ontology Entity Tags (Comma separated)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.entity_tags?.join(", ") || ""}
                      onChange={e => handleListInputChange("entity_tags", e.target.value)}
                      className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary text-xs font-mono"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1 select-text">
                      {selectedDoc.entity_tags.map(tag => (
                        <span key={tag} className="bg-primary/5 border border-primary/20 text-primary px-2 py-0.5 rounded text-[8px] font-mono">
                          {tag}
                        </span>
                      ))}
                      {selectedDoc.entity_tags.length === 0 && <span className="text-[10px] text-muted-foreground">â</span>}
                    </div>
                  )}
                </div>

                {/* Save & Delete actions */}
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(selectedDoc.doc_id)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Asset</span>
                  </button>

                  {isEditing && (
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                  )}
                </div>

              </form>
            </div>
          )}

          {/* Quick Start Help */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">Metadata Alignment</span>
            <p className="text-muted-foreground leading-relaxed">
              When updates are committed, ESKOS evaluates the changed properties against the class validation schemas configured in the **Ontology Manager**:
            </p>
            <div className="p-3 bg-muted/15 border border-border rounded flex items-start space-x-2 text-[10px] text-muted-foreground font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-300">Ontology Rules:</p>
                <p className="mt-1">
                  Product document fields are verified to match specific types (e.g. `max_temp` must be integer). Violations are blocked at the transaction boundary.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
