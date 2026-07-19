"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Save, Check } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";

interface Prompt {
  id: string;
  name: string;
  instruction: string;
}

export default function PromptRegistryView() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editingInstruction, setEditingInstruction] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${KONG_URL}/api/v1/agent/prompts`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      const items = data.prompts || [];
      setPrompts(items);
      if (items.length > 0) {
        setSelectedPrompt(items[0]);
        setEditingInstruction(items[0].instruction);
      }
    } catch (err) {
      console.error("Failed to fetch prompts", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const selectPrompt = (p: Prompt) => {
    setSelectedPrompt(p);
    setEditingInstruction(p.instruction);
    setSavedSuccess(false);
  };

  const savePrompt = async () => {
    if (!selectedPrompt || saving) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`${KONG_URL}/api/v1/agent/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ id: selectedPrompt.id, instruction: editingInstruction }),
      });
      if (res.ok) {
        setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? { ...p, instruction: editingInstruction } : p));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="flex h-full bg-background overflow-hidden relative select-none">
      {/* Sidebar List */}
      <div className="w-80 border-r border-border flex flex-col h-full bg-card/20">
        <div className="p-4 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">System Agent Prompts</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="flex justify-center items-center h-32 text-xs text-muted-foreground font-mono">LOADING PROMPTS...</div>
          ) : (
            prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPrompt(p)}
                className={`w-full flex items-center space-x-2 text-left p-3 rounded transition-all border ${
                  selectedPrompt?.id === p.id
                    ? "bg-muted/80 border-border text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono">{p.id}.md</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col h-full bg-[#070a10]">
        {selectedPrompt ? (
          <div className="flex-1 flex flex-col h-full p-6 space-y-4">
            <div className="flex justify-between items-center select-none border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold text-primary font-mono uppercase tracking-widest">Active Instructions Template</span>
                <div className="flex items-center space-x-3 mt-1">
                  <h1 className="text-base font-bold text-slate-200 font-sans">{selectedPrompt.name}</h1>
                  <DataStateBadge state="live" />
                </div>
              </div>

              <button
                onClick={savePrompt}
                disabled={saving}
                className="flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Saving..." : "Save Prompt"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Instruction editor */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={editingInstruction}
                onChange={(e) => setEditingInstruction(e.target.value)}
                className="flex-1 w-full bg-card text-xs font-mono text-slate-200 border border-border rounded-lg p-5 outline-none resize-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground select-text"
                placeholder="Enter system instruction protocols..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Terminal className="w-10 h-10 text-slate-800" />
            <span className="text-xs font-mono uppercase tracking-wider">Select an instruction template to edit</span>
          </div>
        )}
      </div>
    </div>
  );
}
