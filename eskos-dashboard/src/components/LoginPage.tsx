"use client";

import React, { useState, useEffect, useRef } from "react";
import { Atom, ShieldCheck, Database, Key, Server, Cpu, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginPageProps {
  onLogin: (user: { username: string; role: string; tenant: string }) => void;
}

const DATASETS = [
  { name: "Goel Reactors Metadata", type: "Postgres", detail: "Primary schemas for Goel High Pressure Reactors and technical standard glassware specifications.", icon: Database },
  { name: "Borosil Ontology Mapping", type: "Neo4j Graph", detail: "Relations schema of borosilicate material nodes, temperature bounds, and organization ownerships.", icon: Cpu },
  { name: "Ingestion Vector Embeddings", type: "Qdrant Index", detail: "Vector database collection containing 768-dimensional text embeddings for multi-RAG context matches.", icon: Server }
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("Supervisor Console");
  const [role, setRole] = useState("supervisor");
  const [tenant, setTenant] = useState("goel-scientific");
  const [showPreloader, setShowPreloader] = useState(true);

  // Preloader duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ username, role, tenant });
  };

  return (
    <div className="min-h-screen bg-[#03050a] text-foreground flex items-center justify-center p-6 relative overflow-hidden select-none cyber-grid font-sans">
      {/* Dynamic background canvas overlay */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-soft-glow" />

      {/* Preloader Curtain */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            id="kt-preloader"
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.35)]">
                <Atom className="w-7 h-7 animate-[spin_4s_linear_infinite]" />
              </div>
              <span className="mt-4 text-sm font-bold tracking-widest text-slate-100 uppercase font-sans">
                ESKOS OS INITIALIZING
              </span>
              <div className="pre-progress-container">
                <div className="pre-progress-bar" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Reveal */}
      {!showPreloader && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
        >
          {/* Left Block: Login form */}
          <div className="bg-card/40 border border-border/80 rounded-2xl p-8 backdrop-blur-md flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg">
                  <Atom className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-sm tracking-widest text-slate-200 uppercase">ESKOS</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">Sign in to Scientific OS</h2>
              <p className="text-xs text-muted-foreground">Select your administrative tenant partition and context role to launch workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="kt-form-group">
                <label>User Console Identity</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="kt-form-group">
                  <label>Context Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full"
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="compliance">Compliance Auditor</option>
                    <option value="guest">Guest Scientist</option>
                  </select>
                </div>

                <div className="kt-form-group">
                  <label>Tenant Partition</label>
                  <select
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
                    className="w-full font-mono"
                  >
                    <option value="goel-scientific">goel-scientific</option>
                    <option value="borosil-scientific">borosil-scientific</option>
                    <option value="shared">shared-tenant</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full kt-btn kt-btn-primary flex items-center justify-center space-x-2 mt-2"
              >
                <span>Launch Enterprise Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono border-t border-border/30 pt-4">
              <span>Security Auth: Kong HMAC</span>
              <span>v2.0-Obsidian</span>
            </div>
          </div>

          {/* Right Block: Active Datasets Catalog (Inspired by Product catalog inside KT Impex) */}
          <div className="space-y-4 flex flex-col justify-center">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Accessible Ingestion Catalog
            </span>

            <div className="space-y-3">
              {DATASETS.map((dataset) => {
                const Icon = dataset.icon;
                return (
                  <div
                    key={dataset.name}
                    className="bg-card/20 border border-border/60 p-4 rounded-xl space-y-1.5 backdrop-blur-sm hover:border-slate-800 transition-all text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 font-bold text-slate-200">
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <span>{dataset.name}</span>
                      </div>
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-border/80 text-muted-foreground uppercase">
                        {dataset.type}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed font-sans">
                      {dataset.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
