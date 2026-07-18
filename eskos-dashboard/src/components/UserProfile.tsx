"use client";

import React, { useState } from "react";
import { User, LogOut, ShieldCheck, Terminal, Settings, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Workspace {
  id: string;
  name: string;
  env: "PRODUCTION" | "SANDBOX" | "STAGING";
}

const WORKSPACES: Workspace[] = [
  { id: "ws-1", name: "Scientific Knowledge Fabric", env: "PRODUCTION" },
  { id: "ws-2", name: "Validation Sandbox Loop", env: "SANDBOX" },
  { id: "ws-3", name: "Ontology Modeling Arena", env: "STAGING" }
];

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWs, setActiveWs] = useState<Workspace>(WORKSPACES[0]);

  return (
    <div className="relative select-none font-sans">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2.5 py-1.5 bg-muted/40 border border-border/80 rounded-lg hover:border-slate-700/60 transition-all cursor-pointer"
      >
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white font-bold text-[10px]">
          U
        </div>
        <span className="text-xs text-slate-300 font-semibold hidden md:inline">Supervisor Console</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click backdrop to close */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Profile Dropdown panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50 glass-panel"
            >
              {/* Profile Card */}
              <div className="p-4 border-b border-border/50 bg-background/30 flex items-center space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                  U
                </div>
                <div>
                  <div className="font-bold text-slate-200">Rewant Sharma</div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Staff Knowledge Engineer</div>
                </div>
              </div>

              {/* Workspace Selector List */}
              <div className="p-2 border-b border-border/50 space-y-1">
                <span className="block text-[8px] uppercase font-bold text-slate-500 tracking-widest px-2.5 py-1 font-mono">
                  Switch Fabric Workspace
                </span>
                {WORKSPACES.map((ws) => {
                  const isActive = ws.id === activeWs.id;
                  return (
                    <div
                      key={ws.id}
                      onClick={() => {
                        setActiveWs(ws);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/30 text-slate-400"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block">{ws.name}</span>
                        <span className={`block text-[8px] font-bold font-mono ${
                          ws.env === "PRODUCTION" ? "text-emerald-400" : ws.env === "SANDBOX" ? "text-amber-500" : "text-primary"
                        }`}>{ws.env}</span>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="p-1 space-y-0.5 text-xs text-slate-300 font-mono">
                <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Verify Compliance Keys</span>
                </div>
                <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>Developer Console</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
