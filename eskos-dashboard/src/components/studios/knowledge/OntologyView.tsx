"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, GitMerge, List, Network, Info, AlertTriangle, Loader2 } from "lucide-react";

interface OntologyClass {
  class_name: string;
  description: string;
  color: string;
  properties: Record<string, string>;
}

interface OntologyRelation {
  relation_type: string;
  source_class: string;
  target_class: string;
  description: string;
  properties: Record<string, string>;
}

export default function OntologyView() {
  const [classes, setClasses] = useState<OntologyClass[]>([]);
  const [relations, setRelations] = useState<OntologyRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab control: "graph" | "classes" | "relations"
  const [activeTab, setActiveTab] = useState<"graph" | "classes" | "relations">("graph");
  
  // Selection inspector
  const [selectedClass, setSelectedClass] = useState<OntologyClass | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<OntologyRelation | null>(null);

  // Forms
  const [showClassForm, setShowClassForm] = useState(false);
  const [newClass, setNewClass] = useState({
    class_name: "",
    description: "",
    color: "#3B82F6",
    propKey: "",
    propType: "string",
    properties: {} as Record<string, string>
  });

  const [showRelationForm, setShowRelationForm] = useState(false);
  const [newRelation, setNewRelation] = useState({
    relation_type: "",
    source_class: "",
    target_class: "",
    description: "",
    properties: {} as Record<string, string>
  });

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchOntology = async () => {
    try {
      setLoading(true);
      const [classRes, relationRes] = await Promise.all([
        fetch(`${KONG_URL}/api/v1/knowledge/ontology/classes`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        }),
        fetch(`${KONG_URL}/api/v1/knowledge/ontology/relations`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        })
      ]);

      if (!classRes.ok || !relationRes.ok) {
        throw new Error("Failed to load ontology schema registry.");
      }

      const classesData = await classRes.json();
      const relationsData = await relationRes.json();
      setClasses(classesData);
      setRelations(relationsData);
      setError(null);

      // Select first class by default for the inspector
      if (classesData.length > 0) {
        setSelectedClass(classesData[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load ontology endpoints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOntology();
  }, []);

  // Class CRUD operations
  const handleAddProperty = () => {
    if (!newClass.propKey.trim()) return;
    setNewClass(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [prev.propKey.trim().toLowerCase()]: prev.propType
      },
      propKey: ""
    }));
  };

  const handleRemoveProperty = (keyToRemove: string) => {
    setNewClass(prev => {
      const updated = { ...prev.properties };
      delete updated[keyToRemove];
      return {
        ...prev,
        properties: updated
      };
    });
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.class_name.trim()) return;
    
    // Capitalize class name
    const formattedName = newClass.class_name.trim();
    const payload = {
      class_name: formattedName,
      description: newClass.description.trim(),
      color: newClass.color,
      properties: newClass.properties
    };

    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/ontology/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create class.");
      }
      setShowClassForm(false);
      setNewClass({
        class_name: "",
        description: "",
        color: "#3B82F6",
        propKey: "",
        propType: "string",
        properties: {}
      });
      await fetchOntology();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteClass = async (className: string) => {
    if (!confirm(`Are you sure you want to delete class "${className}"? This will delete all relationships linking to it.`)) return;
    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/ontology/classes/${className}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete class.");
      setSelectedClass(null);
      await fetchOntology();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Relation CRUD operations
  const handleCreateRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRelation.relation_type.trim() || !newRelation.source_class || !newRelation.target_class) {
      alert("All fields are required.");
      return;
    }

    const formattedType = newRelation.relation_type.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, "_");
    const payload = {
      relation_type: formattedType,
      source_class: newRelation.source_class,
      target_class: newRelation.target_class,
      description: newRelation.description.trim(),
      properties: newRelation.properties
    };

    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/ontology/relations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create relationship.");
      }
      setShowRelationForm(false);
      setNewRelation({
        relation_type: "",
        source_class: "",
        target_class: "",
        description: "",
        properties: {}
      });
      await fetchOntology();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteRelation = async (relationType: string) => {
    if (!confirm(`Are you sure you want to delete relationship "${relationType}"?`)) return;
    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/ontology/relations/${relationType}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete relationship.");
      setSelectedRelation(null);
      await fetchOntology();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Node placements for radial diagram view
  const width = 600;
  const height = 450;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 150;

  const nodeMap: Record<string, { x: number; y: number; color: string }> = {};
  classes.forEach((c, idx) => {
    const angle = (idx * 2 * Math.PI) / classes.length - Math.PI / 2;
    nodeMap[c.class_name] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      color: c.color
    };
  });

  if (loading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Querying Ontology Schema Registry...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Ontology Manager</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Design logical classes, validate entity properties, and control edge relation maps.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Tabs */}
          <div className="bg-card border border-border rounded p-0.5 flex items-center text-xs font-mono text-muted-foreground mr-2">
            <button
              onClick={() => setActiveTab("graph")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === "graph" ? "bg-primary text-white font-semibold" : "hover:text-slate-200"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schema Graph</span>
            </button>
            <button
              onClick={() => setActiveTab("classes")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === "classes" ? "bg-primary text-white font-semibold" : "hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Entity Classes</span>
            </button>
            <button
              onClick={() => setActiveTab("relations")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === "relations" ? "bg-primary text-white font-semibold" : "hover:text-slate-200"
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Relationships</span>
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={() => {
              setShowClassForm(true);
              setShowRelationForm(false);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
          >
            <Plus className="w-3 h-3" />
            <span>Class</span>
          </button>
          <button
            onClick={() => {
              setShowRelationForm(true);
              setShowClassForm(false);
              // Set default values for dropdowns
              if (classes.length > 0) {
                setNewRelation(prev => ({
                  ...prev,
                  source_class: classes[0].class_name,
                  target_class: classes[0].class_name
                }));
              }
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
          >
            <Plus className="w-3 h-3" />
            <span>Relation</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Workspace Column (Left) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Modal / Inline Add Class Form */}
          {showClassForm && (
            <form onSubmit={handleCreateClass} className="bg-card border border-border rounded-lg p-5 space-y-4 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Create Entity Class</span>
                <button type="button" onClick={() => setShowClassForm(false)} className="text-muted-foreground hover:text-foreground">â</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Class Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Instrument"
                    value={newClass.class_name}
                    onChange={e => setNewClass(prev => ({ ...prev, class_name: e.target.value.replace(/[^a-zA-Z0-9]/g, "") }))}
                    className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-muted-foreground font-semibold">Class Description</label>
                  <input
                    type="text"
                    required
                    placeholder="Describe what entities in this class represent..."
                    value={newClass.description}
                    onChange={e => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Node Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newClass.color}
                      onChange={e => setNewClass(prev => ({ ...prev, color: e.target.value }))}
                      className="w-8 h-8 rounded border border-border bg-transparent outline-none cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{newClass.color}</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-muted-foreground font-semibold">Add Schema Property Key & Type</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. pressure_rating"
                      value={newClass.propKey}
                      onChange={e => setNewClass(prev => ({ ...prev, propKey: e.target.value.replace(/[^a-zA-Z_]/g, "") }))}
                      className="flex-1 bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans"
                    />
                    <select
                      value={newClass.propType}
                      onChange={e => setNewClass(prev => ({ ...prev, propType: e.target.value }))}
                      className="bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans"
                    >
                      <option value="string">String</option>
                      <option value="int">Integer</option>
                      <option value="float">Float</option>
                      <option value="boolean">Boolean</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddProperty}
                      className="px-3 bg-slate-800 border border-border rounded font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Properties list */}
              {Object.keys(newClass.properties).length > 0 && (
                <div className="p-3 bg-muted/10 border border-border rounded space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Defined Attributes Schema</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(newClass.properties).map(([key, type]) => (
                      <div key={key} className="flex items-center space-x-2 bg-slate-800 border border-border px-2 py-1 rounded text-[10px] font-mono">
                        <span className="text-slate-300 font-semibold">{key}:</span>
                        <span className="text-primary uppercase font-bold">{type}</span>
                        <button type="button" onClick={() => handleRemoveProperty(key)} className="text-red-400 hover:text-red-300 font-bold ml-1">â</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowClassForm(false)}
                  className="px-3 py-1.5 bg-transparent hover:bg-muted text-muted-foreground rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Class Creation
                </button>
              </div>
            </form>
          )}

          {/* Modal / Inline Add Relation Form */}
          {showRelationForm && (
            <form onSubmit={handleCreateRelation} className="bg-card border border-border rounded-lg p-5 space-y-4 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Create Relationship Type</span>
                <button type="button" onClick={() => setShowRelationForm(false)} className="text-muted-foreground hover:text-foreground">â</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Relationship Name (Caps)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COMPATIBLE_WITH"
                    value={newRelation.relation_type}
                    onChange={e => setNewRelation(prev => ({ ...prev, relation_type: e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toUpperCase() }))}
                    className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Source Class</label>
                  <select
                    value={newRelation.source_class}
                    onChange={e => setNewRelation(prev => ({ ...prev, source_class: e.target.value }))}
                    className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans"
                  >
                    {classes.map(c => (
                      <option key={c.class_name} value={c.class_name}>{c.class_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Target Class</label>
                  <select
                    value={newRelation.target_class}
                    onChange={e => setNewRelation(prev => ({ ...prev, target_class: e.target.value }))}
                    className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans"
                  >
                    {classes.map(c => (
                      <option key={c.class_name} value={c.class_name}>{c.class_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Relationship Description</label>
                <input
                  type="text"
                  required
                  placeholder="Describe the logical connection, validation rules, or semantic constraint..."
                  value={newRelation.description}
                  onChange={e => setNewRelation(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-background border border-border p-2 rounded text-slate-200 outline-none focus:border-primary font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowRelationForm(false)}
                  className="px-3 py-1.5 bg-transparent hover:bg-muted text-muted-foreground rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Relation Creation
                </button>
              </div>
            </form>
          )}

          {/* Render Tab Contents */}
          {activeTab === "graph" && (
            <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between items-center">
              <div className="w-full flex justify-between items-center border-b border-border pb-3 mb-4">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Semantic Ontological Network</span>
                <span className="text-[10px] text-muted-foreground font-sans">Click on any node/label to inspect attributes.</span>
              </div>
              
              <div className="relative border border-border rounded bg-muted/5 w-full flex items-center justify-center overflow-hidden h-[460px]">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="20"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                    </marker>
                  </defs>

                  {/* Draw relationships */}
                  {relations.map((rel, idx) => {
                    const src = nodeMap[rel.source_class];
                    const tgt = nodeMap[rel.target_class];
                    if (!src || !tgt) return null;

                    // Compute label offsets
                    const mx = (src.x + tgt.x) / 2;
                    const my = (src.y + tgt.y) / 2;
                    
                    const isSelected = selectedRelation?.relation_type === rel.relation_type;

                    return (
                      <g key={`rel-${idx}`} className="cursor-pointer group" onClick={() => { setSelectedRelation(rel); setSelectedClass(null); }}>
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={isSelected ? "#3B82F6" : "#475569"}
                          strokeWidth={isSelected ? 2 : 1}
                          strokeDasharray={rel.source_class === rel.target_class ? "4,4" : "none"}
                          markerEnd="url(#arrow)"
                          className="group-hover:stroke-slate-200 transition-all"
                        />
                        {/* Text background bubble */}
                        <rect
                          x={mx - 40}
                          y={my - 7}
                          width="80"
                          height="14"
                          fill="#090d16"
                          rx="3"
                          stroke={isSelected ? "#3B82F6" : "transparent"}
                          strokeWidth="0.5"
                        />
                        <text
                          x={mx}
                          y={my + 3}
                          textAnchor="middle"
                          fill={isSelected ? "#93C5FD" : "#94A3B8"}
                          className="text-[7px] font-mono tracking-wider font-bold"
                        >
                          {rel.relation_type}
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw node entities */}
                  {classes.map((c, idx) => {
                    const pos = nodeMap[c.class_name];
                    if (!pos) return null;

                    const isSelected = selectedClass?.class_name === c.class_name;

                    return (
                      <g
                        key={`class-${idx}`}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className="cursor-pointer group"
                        onClick={() => { setSelectedClass(c); setSelectedRelation(null); }}
                      >
                        <circle
                          r="32"
                          fill="#0f172a"
                          stroke={isSelected ? "#3B82F6" : c.color}
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="group-hover:scale-105 transition-all"
                        />
                        <circle
                          r="5"
                          cx="-15"
                          cy="-15"
                          fill={c.color}
                        />
                        <text
                          textAnchor="middle"
                          y="4"
                          fill="#E2E8F0"
                          className="text-[9px] font-mono font-bold"
                        >
                          {c.class_name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {activeTab === "classes" && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono border-b border-border pb-3">Entity Classes Registry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((c) => (
                  <div
                    key={c.class_name}
                    onClick={() => { setSelectedClass(c); setSelectedRelation(null); }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedClass?.class_name === c.class_name
                        ? "bg-slate-800/40 border-primary shadow-sm"
                        : "bg-muted/10 border-border hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs font-semibold text-slate-200 font-sans">{c.class_name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClass(c.class_name); }}
                        className="text-muted-foreground hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-sans line-clamp-2">{c.description}</p>
                    <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-muted-foreground border-t border-border/40 pt-2">
                      <span>ATTRIBUTES: {Object.keys(c.properties).length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "relations" && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono border-b border-border pb-3">Ontology Relations Registry</h3>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-[10px] text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground pb-2">
                      <th className="py-2.5 font-bold uppercase">Relationship Type</th>
                      <th className="py-2.5 font-bold uppercase">Source Class</th>
                      <th className="py-2.5 font-bold uppercase">&rarr; Target Class</th>
                      <th className="py-2.5 font-bold uppercase hidden md:table-cell">Semantic Constraint Description</th>
                      <th className="py-2.5 font-bold text-right uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relations.map((rel) => (
                      <tr
                        key={rel.relation_type}
                        onClick={() => { setSelectedRelation(rel); setSelectedClass(null); }}
                        className={`border-b border-border/40 hover:bg-muted/10 cursor-pointer ${
                          selectedRelation?.relation_type === rel.relation_type ? "bg-slate-800/20" : ""
                        }`}
                      >
                        <td className="py-3 font-bold text-slate-200">{rel.relation_type}</td>
                        <td className="py-3 text-slate-300">{rel.source_class}</td>
                        <td className="py-3 text-slate-300">{rel.target_class}</td>
                        <td className="py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">{rel.description}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRelation(rel.relation_type); }}
                            className="text-muted-foreground hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Inspector Column (Right) */}
        <div className="space-y-6">
          
          {/* Class Inspector */}
          {selectedClass && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4 font-sans text-xs">
              <div className="flex items-center space-x-2 border-b border-border pb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedClass.color }} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Class Inspector</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">CLASS NAME</span>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{selectedClass.class_name}</p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">DESCRIPTION DESCRIPTION</span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{selectedClass.description}</p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">VALIDATION ATTRIBUTES SCHEMA</span>
                  {Object.keys(selectedClass.properties).length === 0 ? (
                    <div className="flex items-center space-x-1.5 p-3 rounded border border-border bg-muted/5 mt-1.5 text-muted-foreground">
                      <Info className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px]">No attribute properties mapped. Schema is free-form.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 mt-1.5">
                      {Object.entries(selectedClass.properties).map(([key, type]) => (
                        <div key={key} className="flex justify-between items-center bg-muted/20 border border-border px-3 py-1.5 rounded font-mono text-[10px]">
                          <span className="text-slate-300 font-semibold">{key}</span>
                          <span className="text-primary font-bold uppercase">{type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleDeleteClass(selectedClass.class_name)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Class</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Relation Inspector */}
          {selectedRelation && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4 font-sans text-xs">
              <div className="flex items-center space-x-2 border-b border-border pb-3">
                <GitMerge className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Relation Inspector</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">RELATIONSHIP TYPE</span>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">{selectedRelation.relation_type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/10 border border-border p-3 rounded font-mono text-[10px]">
                  <div>
                    <span className="text-muted-foreground">SOURCE CLASS</span>
                    <p className="text-slate-200 font-semibold mt-0.5">{selectedRelation.source_class}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TARGET CLASS</span>
                    <p className="text-slate-200 font-semibold mt-0.5">{selectedRelation.target_class}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">SEMANTIC DESCRIPTION</span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{selectedRelation.description}</p>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleDeleteRelation(selectedRelation.relation_type)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Relation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Start Help */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">Ontology Guidelines</span>
            <p className="text-muted-foreground leading-relaxed">
              Ontologies form the semantic backbone of the platform. Whenever a document is ingested, ESKOS:
            </p>
            <ol className="list-decimal pl-4 text-muted-foreground space-y-1">
              <li>Analyzes text nodes using Spacy and extracts scientific entities.</li>
              <li>Validates properties matching the class template schemas defined here.</li>
              <li>Builds relations in Neo4j only if the edges match the registered ontology bounds.</li>
            </ol>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded flex items-center space-x-2 text-[10px] text-primary">
              <GitMerge className="w-4 h-4 shrink-0" />
              <span>Relationships mapped here are enforced across all indexing microservices.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
