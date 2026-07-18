"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Terminal, Keyboard, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  name: string;
  category: string;
  href: string;
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard", name: "Knowledge Dashboard", category: "Knowledge Studio", href: "/knowledge/dashboard" },
  { id: "explorer", name: "Knowledge Explorer", category: "Knowledge Studio", href: "/knowledge/explorer" },
  { id: "metadata", name: "Metadata Manager", category: "Knowledge Studio", href: "/knowledge/metadata" },
  { id: "ontology", name: "Ontology Manager", category: "Knowledge Studio", href: "/knowledge/ontology" },
  { id: "graph", name: "Knowledge Graph", category: "Knowledge Studio", href: "/knowledge/graph" },
  { id: "chunks", name: "Chunk Explorer", category: "Knowledge Studio", href: "/knowledge/chunks" },
  { id: "embeddings", name: "Embedding Explorer", category: "Knowledge Studio", href: "/knowledge/embeddings" },
  { id: "trust", name: "Trust Center", category: "Knowledge Studio", href: "/knowledge/trust" },
  { id: "search", name: "Search Studio", category: "Knowledge Studio", href: "/knowledge/search" },
  { id: "gap-analysis", name: "Knowledge Gap Analysis", category: "Knowledge Studio", href: "/knowledge/gap-analysis" },
  
  { id: "chat", name: "AI Chatbot Terminal", category: "Agent Studio", href: "/agent/chat" },
  { id: "planner", name: "Multi-Agent Planner", category: "Agent Studio", href: "/agent/planner" },
  { id: "workflows", name: "Orchestration Workflows", category: "Agent Studio", href: "/agent/workflows" },
  { id: "tools", name: "Tool Registry Config", category: "Agent Studio", href: "/agent/tools" },
  { id: "prompts", name: "Prompt Registry Config", category: "Agent Studio", href: "/agent/prompts" },
  { id: "memory", name: "Agent Memory Inspector", category: "Agent Studio", href: "/agent/memory" },
  { id: "monitoring", name: "Agent Health Monitoring", category: "Agent Studio", href: "/agent/monitoring" },
  { id: "cost-analytics", name: "Dynamic Token Cost Ledger", category: "Agent Studio", href: "/agent/cost-analytics" },

  { id: "review-queue", name: "Governance Review Queue", category: "Governance Studio", href: "/governance/review-queue" },
  { id: "provenance", name: "Provenance Lineage Trace", category: "Governance Studio", href: "/governance/provenance" },
  { id: "citations", name: "Citations Grounding Checker", category: "Governance Studio", href: "/governance/citations" },
  { id: "audit-trail", name: "Cryptographic Audit Ledger", category: "Governance Studio", href: "/governance/audit-trail" },
  { id: "compliance", name: "Security Compliance Dashboard", category: "Governance Studio", href: "/governance/compliance" },

  { id: "tenant-config", name: "Tenant Settings Config", category: "Administration", href: "/admin/tenant-config" },
  { id: "api-keys", name: "API Key Management", category: "Administration", href: "/admin/api-keys" },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSearch("");
      setSelectedIdx(0);
    }
  }, [isOpen]);

  const filtered = COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    setIsOpen(false);
    router.push(cmd.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) {
        handleSelect(filtered[selectedIdx]);
      }
    }
  };

  return (
    <>
      {/* Global Open Trigger Button shown on custom top navigation */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-muted/40 border border-border hover:border-slate-700/60 rounded-lg text-muted-foreground hover:text-slate-200 transition-all text-xs cursor-pointer select-none"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-[11px] font-sans">Search Operating System...</span>
        <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-border bg-background px-1 text-[9px] font-bold font-mono">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 select-none">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-popover/90 border border-border/80 rounded-xl overflow-hidden shadow-2xl flex flex-col font-sans z-10 mx-4 glass-panel"
            >
              {/* Input container */}
              <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-border/50 bg-background/30">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIdx(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a studio name, module, or command..."
                  className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500 w-full select-text"
                />
                <kbd className="text-[9px] bg-background/50 border border-border px-1.5 py-0.5 rounded font-mono text-slate-500">
                  ESC
                </kbd>
              </div>

              {/* Items List */}
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
                {filtered.map((cmd, idx) => {
                  const isSelected = idx === selectedIdx;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary text-white"
                          : "hover:bg-muted/30 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Terminal className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-primary/60"}`} />
                        <span className="text-xs font-semibold font-sans">{cmd.name}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isSelected
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-border bg-background/50 text-slate-400"
                        }`}>
                          {cmd.category}
                        </span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 animate-pulse text-white" />}
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
                    <Sparkles className="w-5 h-5 text-slate-600 animate-pulse" />
                    <span>No results found matching your search.</span>
                  </div>
                )}
              </div>

              {/* Footer status line */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-background/50 text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center space-x-1">
                  <Keyboard className="w-3 h-3 text-slate-500" />
                  <span>Use arrows to navigate, enter to run</span>
                </span>
                <span>Deterministic Scientific OS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
