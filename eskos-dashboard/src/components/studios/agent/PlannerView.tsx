"use client";

import React, { useState } from "react";
import { 
  Cpu, FileText, ShieldCheck, RefreshCw, Send, CheckCircle2, 
  AlertTriangle, DollarSign, ArrowRight, Loader2, Play, Settings2, Sparkles, Award
} from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

export default function PlannerView() {
  const [activeTab, setActiveTab] = useState<"eeat" | "brand" | "price">("eeat");

  // Agent 4: E-E-A-T Content Generator State
  const [eeatTopic, setEeatTopic] = useState("Thermal toleration tolerances for premium industrial borosilicate 3.3 glassware assemblies");
  const [eeatOrg, setEeatOrg] = useState("goel-scientific");
  const [eeatLoading, setEeatLoading] = useState(false);
  const [eeatResult, setEeatResult] = useState<any>(null);

  // Agent 1: Brand Protection State
  const [brandQuery, setBrandQuery] = useState("Are Goel Scientific pressure reactors certified under global ISO guidelines?");
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandResult, setBrandResult] = useState<any>(null);

  // Agent 7: Pricing Override State
  const [targetMargin, setTargetMargin] = useState(25);
  const [discountThreshold, setDiscountThreshold] = useState(95);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<any>(null);

  // Handlers
  const handleRunEeat = async () => {
    try {
      setEeatLoading(true);
      const res = await fetch("/api/agent/eeat-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: eeatTopic, orgId: eeatOrg })
      });
      if (!res.ok) throw new Error("Failed content generation run.");
      const data = await res.json();
      setEeatResult(data);
    } catch (err: any) {
      alert("E-E-A-T Content Agent Error: " + err.message);
    } finally {
      setEeatLoading(false);
    }
  };

  const handleRunBrandProtect = async () => {
    try {
      setBrandLoading(true);
      const res = await fetch("/api/agent/brand-protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: brandQuery, brand: eeatOrg === "goel-scientific" ? "Goel Scientific Glass Works" : "Borosil Scientific" })
      });
      if (!res.ok) throw new Error("Failed brand safety audit scan.");
      const data = await res.json();
      setBrandResult(data);
    } catch (err: any) {
      alert("Brand Protect Agent Error: " + err.message);
    } finally {
      setBrandLoading(false);
    }
  };

  const handleRunPricingOverride = async () => {
    try {
      setPricingLoading(true);
      const res = await fetch("/api/agent/price-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMargin, discountThreshold })
      });
      if (!res.ok) throw new Error("Failed competitive pricing override run.");
      const data = await res.json();
      setPricingResult(data);
    } catch (err: any) {
      alert("Pricing Override Agent Error: " + err.message);
    } finally {
      setPricingLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none font-sans">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Multi-Agent Planner</h1>
          <DataStateBadge state="simulated" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Configure, test, and orchestrate high-yield autonomous business agents (Agent 1, Agent 4, and Agent 7).
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border/60 text-xs font-mono">
        <button
          onClick={() => setActiveTab("eeat")}
          className={`px-4 py-2.5 font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "eeat" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 4: E-E-A-T Generator
        </button>
        <button
          onClick={() => setActiveTab("brand")}
          className={`px-4 py-2.5 font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "brand" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 1: Brand Protection
        </button>
        <button
          onClick={() => setActiveTab("price")}
          className={`px-4 py-2.5 font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "price" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 7: Catalog Pricing Sync
        </button>
      </div>

      {/* Content views */}
      <div className="bg-card/25 border border-border p-5 rounded-lg">
        
        {/* Tab 1: Scientific E-E-A-T Content Generator */}
        {activeTab === "eeat" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Scientific E-E-A-T Content Engine (Agent 4)</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Topic Description</label>
                <textarea
                  value={eeatTopic}
                  onChange={(e) => setEeatTopic(e.target.value)}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans h-20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Organization Partition</label>
                <select
                  value={eeatOrg}
                  onChange={(e) => setEeatOrg(e.target.value)}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans"
                >
                  <option value="goel-scientific">Goel Scientific Glass Works</option>
                  <option value="borosil-scientific">Borosil Scientific</option>
                </select>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRunEeat}
                disabled={eeatLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {eeatLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing RAG Walk & Draft Compilation...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Synthesize & Submit Draft</span>
                  </>
                )}
              </button>
            </div>

            {eeatResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-border/40">
                <div className="lg:col-span-2 space-y-3.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Generated Article Draft</span>
                    <span className="text-emerald-400 font-bold uppercase">Ready for review ({eeatResult.draft_id})</span>
                  </div>
                  <div className="bg-background border border-border p-4 rounded font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                    {eeatResult.content}
                  </div>
                </div>

                <div className="border border-border p-4 rounded bg-[#0b101d]/20 space-y-4">
                  <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span>Grounded Sources</span>
                  </span>
                  <div className="space-y-2">
                    {eeatResult.grounded_sources.map((src: any) => (
                      <div key={src.id} className="p-2.5 bg-background border border-border rounded flex flex-col space-y-1">
                        <span className="font-mono text-slate-400 font-bold">{src.id}</span>
                        <span className="text-[11px] text-slate-200 font-sans">{src.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Brand Protection Agent */}
        {activeTab === "brand" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Generative Brand Authority Shield (Agent 1)</span>
            </span>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Brand Query Audit Target</label>
              <input
                type="text"
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRunBrandProtect}
                disabled={brandLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {brandLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning Public AI Assistants...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Audit Search Assistants</span>
                  </>
                )}
              </button>
            </div>

            {brandResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                <div className="space-y-4 bg-rose-950/15 border border-rose-500/25 p-4 rounded">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Hallucination Audit Result</span>
                  </span>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Source Assistant</span>
                      <span className="text-slate-300 font-bold">{brandResult.audit_detail.ai_assistant}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Incorrect Claim</span>
                      <p className="text-rose-300 font-mono leading-relaxed mt-0.5">"{brandResult.audit_detail.incorrect_claim}"</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Grounded Target Spec</span>
                      <p className="text-emerald-400 font-mono leading-relaxed mt-0.5">"{brandResult.audit_detail.grounded_specification}"</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-muted/20 border border-border p-4 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Compiled JSON-LD Correction Grounding Patch</span>
                    </span>
                    <pre className="text-[10px] text-indigo-400 font-mono mt-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {JSON.stringify(brandResult.compiled_schema, null, 2)}
                    </pre>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Target: schema.org validation</span>
                    <span className="text-emerald-400 font-bold uppercase">{brandResult.action_taken}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Competitive Pricing Override Agent */}
        {activeTab === "price" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span>Catalog Pricing Competitor Sync Engine (Agent 7)</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Minimum Profit Margin Guardrail (%)</label>
                <input
                  type="number"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Competitor Price Match Target (%)</label>
                <input
                  type="number"
                  value={discountThreshold}
                  onChange={(e) => setDiscountThreshold(Number(e.target.value))}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRunPricingOverride}
                disabled={pricingLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {pricingLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scraping Competitor Pricing & Recalculating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Pricing Audit & Sync</span>
                  </>
                )}
              </button>
            </div>

            {pricingResult && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Dynamic Price Sync Audit Ledger</span>
                  <span className="text-emerald-400 font-bold uppercase">Transaction Secured ({pricingResult.transaction_receipt})</span>
                </div>

                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0b101d]/60 border-b border-border text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Current Goel Price</th>
                        <th className="p-3">Competitor Price</th>
                        <th className="p-3">Optimized Target</th>
                        <th className="p-3">Forecast Margin</th>
                        <th className="p-3 text-right">Transaction Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-slate-300 font-mono text-[11px]">
                      {pricingResult.overrides.map((ov: any) => (
                        <tr key={ov.doc_id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-sans text-slate-200">{ov.name}</td>
                          <td className="p-3 text-slate-400">{ov.original_price}</td>
                          <td className="p-3 text-slate-400">{ov.competitor_price}</td>
                          <td className="p-3 text-indigo-400 font-bold">{ov.optimized_price}</td>
                          <td className="p-3 text-slate-300">{ov.simulated_margin}</td>
                          <td className="p-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              ov.status === "UPDATED" 
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            }`}>
                              {ov.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
