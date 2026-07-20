"use client";

import React, { useState } from "react";
import { 
  Cpu, FileText, ShieldCheck, DollarSign, Play, Loader2, Award, 
  Sparkles, AlertTriangle, Search, Activity, Brain, CheckCircle2, ChevronRight, BarChart2
} from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

export default function PlannerView() {
  const [activeTab, setActiveTab] = useState<"authoring" | "seo" | "competitive" | "monitoring" | "learning" | "brand" | "price">("authoring");

  // Agent 1: Scientific Authoring State
  const [authoringTopic, setAuthoringTopic] = useState("Generate a comprehensive scientific datasheet for high-pressure borosilicate 3.3 glass reaction vessels with ISO 3585 thermal specs.");
  const [authoringOrg, setAuthoringOrg] = useState("goel-scientific");
  const [authoringLoading, setAuthoringLoading] = useState(false);
  const [authoringResult, setAuthoringResult] = useState<any>(null);

  // Agent 2: SEO / GEO / AEO State
  const [seoTopic, setSeoTopic] = useState("Optimize product specification for Liebig Condensers with AEO snippets and JSON-LD schema");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<any>(null);

  // Agent 3: Competitive Intelligence State
  const [compQuery, setCompQuery] = useState("Benchmark Borosil / Goel Scientific pressure reactors vs De Dietrich QVF and Buchiglasuster pilot plants on pressure limits and ISO 3585 thermal shock specs");
  const [compLoading, setCompLoading] = useState(false);
  const [compResult, setCompResult] = useState<any>(null);

  // Agent 4: Monitoring Intelligence State
  const [monQuery, setMonQuery] = useState("Analyze current system health, vector index freshness, postgres persistence, and token cost anomalies");
  const [monLoading, setMonLoading] = useState(false);
  const [monResult, setMonResult] = useState<any>(null);

  // Agent 5: Learning & Optimization State
  const [learnQuery, setLearnQuery] = useState("Evaluate historical retrieval precision, human review edit history, and formulate prompt/ontology optimization recommendations");
  const [learnLoading, setLearnLoading] = useState(false);
  const [learnResult, setLearnResult] = useState<any>(null);

  // Brand Protect State
  const [brandQuery, setBrandQuery] = useState("Are Goel Scientific pressure reactors certified under global ISO guidelines?");
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandResult, setBrandResult] = useState<any>(null);

  // Pricing Override State
  const [targetMargin, setTargetMargin] = useState(25);
  const [discountThreshold, setDiscountThreshold] = useState(95);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<any>(null);

  // Generic runner via Agent Chat API
  const runAgentChat = async (message: string, orgId: string = "goel-scientific") => {
    const res = await fetch("/api/v1/agent/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-eskos-org-id": orgId,
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      throw new Error(`Agent execution failed with HTTP status ${res.status}`);
    }
    return res.json();
  };

  // Handlers
  const handleRunAuthoring = async () => {
    try {
      setAuthoringLoading(true);
      const data = await runAgentChat(`draft scientific datasheet: ${authoringTopic}`, authoringOrg);
      setAuthoringResult(data);
    } catch (err: any) {
      alert("Authoring Agent Error: " + err.message);
    } finally {
      setAuthoringLoading(false);
    }
  };

  const handleRunSeo = async () => {
    try {
      setSeoLoading(true);
      const data = await runAgentChat(seoTopic, "shared");
      setSeoResult(data);
    } catch (err: any) {
      alert("SEO Agent Error: " + err.message);
    } finally {
      setSeoLoading(false);
    }
  };

  const handleRunCompetitive = async () => {
    try {
      setCompLoading(true);
      const data = await runAgentChat(compQuery, "goel-scientific");
      setCompResult(data);
    } catch (err: any) {
      alert("Competitive Agent Error: " + err.message);
    } finally {
      setCompLoading(false);
    }
  };

  const handleRunMonitoring = async () => {
    try {
      setMonLoading(true);
      const data = await runAgentChat(monQuery, "shared");
      setMonResult(data);
    } catch (err: any) {
      alert("Monitoring Agent Error: " + err.message);
    } finally {
      setMonLoading(false);
    }
  };

  const handleRunLearning = async () => {
    try {
      setLearnLoading(true);
      const data = await runAgentChat(learnQuery, "shared");
      setLearnResult(data);
    } catch (err: any) {
      alert("Learning Agent Error: " + err.message);
    } finally {
      setLearnLoading(false);
    }
  };

  const handleRunBrandProtect = async () => {
    try {
      setBrandLoading(true);
      const res = await fetch("/api/agent/brand-protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: brandQuery, brand: authoringOrg === "goel-scientific" ? "Goel Scientific Glass Works" : "Borosil Scientific" })
      });
      if (!res.ok) throw new Error("Failed brand safety audit scan.");
      const data = await res.json();
      setBrandResult(data);
    } catch (err: any) {
      alert("Brand Protect Error: " + err.message);
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
      alert("Pricing Override Error: " + err.message);
    } finally {
      setPricingLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none font-sans">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Multi-Agent Orchestrator & Planner</h1>
          <DataStateBadge state="live" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-sans">
          Orchestrate and test the full suite of ESKOS enterprise reasoning nodes (Scientific Authoring, SEO/GEO, Competitive Intel, Telemetry Reasoning, and Meta-Learning).
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border/60 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab("authoring")}
          className={`px-3.5 py-2.5 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "authoring" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 1: Scientific Authoring
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-3.5 py-2.5 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "seo" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 2: SEO / GEO / AEO
        </button>
        <button
          onClick={() => setActiveTab("competitive")}
          className={`px-3.5 py-2.5 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "competitive" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 3: Competitive Intel
        </button>
        <button
          onClick={() => setActiveTab("monitoring")}
          className={`px-3.5 py-2.5 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "monitoring" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 4: Telemetry Reasoning
        </button>
        <button
          onClick={() => setActiveTab("learning")}
          className={`px-3.5 py-2.5 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "learning" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Agent 5: Meta-Learning
        </button>
        <button
          onClick={() => setActiveTab("brand")}
          className={`px-3.5 py-2.5 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "brand" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Brand Protection
        </button>
        <button
          onClick={() => setActiveTab("price")}
          className={`px-3.5 py-2.5 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
            activeTab === "price" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Catalog Pricing Sync
        </button>
      </div>

      {/* Content views */}
      <div className="bg-card/25 border border-border p-5 rounded-lg">
        
        {/* Tab 1: Scientific Authoring Agent */}
        {activeTab === "authoring" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Scientific Authoring Agent (Agent 1) — Grounded Technical Synthesizer</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Authoring Instruction / Prompt</label>
                <textarea
                  value={authoringTopic}
                  onChange={(e) => setAuthoringTopic(e.target.value)}
                  className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans h-20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Organization Context</label>
                <select
                  value={authoringOrg}
                  onChange={(e) => setAuthoringOrg(e.target.value)}
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
                onClick={handleRunAuthoring}
                disabled={authoringLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {authoringLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing LangGraph State Graph & Draft Compilation...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Scientific Authoring Agent</span>
                  </>
                )}
              </button>
            </div>

            {authoringResult && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Authoring Output & Governance Status</span>
                  <span className="text-emerald-400 font-bold uppercase">COMPLETED ({authoringResult.trace?.length || 0} trace steps)</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-background border border-border p-4 rounded font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                    {authoringResult.reply}
                  </div>

                  <div className="border border-border p-4 rounded bg-[#0b101d]/20 space-y-3">
                    <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-primary" />
                      <span>Orchestration Trace</span>
                    </span>
                    <div className="space-y-2 text-[10px] font-mono max-h-80 overflow-y-auto">
                      {authoringResult.trace?.map((t: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background border border-border rounded flex flex-col space-y-0.5">
                          <span className="text-primary font-bold uppercase">{t.agent} &rarr; {t.action}</span>
                          {t.message && <span className="text-slate-400 font-sans text-[11px]">{t.message}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SEO / GEO / AEO Agent */}
        {activeTab === "seo" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <Search className="w-3.5 h-3.5 text-primary" />
              <span>SEO / GEO / AEO Optimization Agent (Agent 2) — Generative Search & JSON-LD Generator</span>
            </span>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Target Optimization Query</label>
              <textarea
                value={seoTopic}
                onChange={(e) => setSeoTopic(e.target.value)}
                className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans h-20"
              />
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRunSeo}
                disabled={seoLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {seoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating JSON-LD Schema & AEO Direct Answers...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run SEO / GEO / AEO Optimization</span>
                  </>
                )}
              </button>
            </div>

            {seoResult && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Optimized Content Output (AEO & JSON-LD Schema)</span>
                  <span className="text-cyan-400 font-bold uppercase">SEO ENHANCED</span>
                </div>
                <div className="bg-background border border-border p-4 rounded font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                  {seoResult.reply}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Competitive Intelligence Agent */}
        {activeTab === "competitive" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <BarChart2 className="w-3.5 h-3.5 text-primary" />
              <span>Competitive Intelligence Agent (Agent 3) — Market Benchmarking & SERP Gap Scanner</span>
            </span>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Competitor Benchmark Query</label>
              <textarea
                value={compQuery}
                onChange={(e) => setCompQuery(e.target.value)}
                className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans h-20"
              />
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRunCompetitive}
                disabled={compLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {compLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching Live SERP Data & Benchmarking Competitors...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Synthesize Competitive Intelligence Report</span>
                  </>
                )}
              </button>
            </div>

            {compResult && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Executive Market Intelligence Report</span>
                  <span className="text-emerald-400 font-bold uppercase">MARKET AUDIT COMPLETE</span>
                </div>
                <div className="bg-background border border-border p-4 rounded font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                  {compResult.reply}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Monitoring Intelligence Agent */}
        {activeTab === "monitoring" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Monitoring Intelligence Agent (Agent 4) — Operational Telemetry Reasoning</span>
            </span>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Infrastructure Telemetry Query Target</label>
              <textarea
                value={monQuery}
                onChange={(e) => setMonQuery(e.target.value)}
                className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans h-20"
              />
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRunMonitoring}
                disabled={monLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {monLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Database & Vector Index Metrics...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Operational Telemetry Audit</span>
                  </>
                )}
              </button>
            </div>

            {monResult && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Operational Infrastructure Diagnosis</span>
                  <span className="text-blue-400 font-bold uppercase">TELEMETRY DIAGNOSED</span>
                </div>
                <div className="bg-background border border-border p-4 rounded font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                  {monResult.reply}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Learning & Optimization Agent */}
        {activeTab === "learning" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span>Learning & Optimization Agent (Agent 5) — Meta-Reasoning & System Precision Tuning</span>
            </span>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-mono">Meta-Learning Focus Area</label>
              <textarea
                value={learnQuery}
                onChange={(e) => setLearnQuery(e.target.value)}
                className="w-full bg-background border border-border p-2.5 rounded text-xs text-slate-200 outline-none focus:border-primary font-sans h-20"
              />
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleRunLearning}
                disabled={learnLoading}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {learnLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Meta-Reasoning & Prompt Tuning Recommendations...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Formulate Meta-Learning Recommendations</span>
                  </>
                )}
              </button>
            </div>

            {learnResult && (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>System Optimization Proposals (Advisory Recommendations)</span>
                  <span className="text-amber-300 font-bold uppercase">PROPOSAL GENERATED</span>
                </div>
                <div className="bg-background border border-border p-4 rounded font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                  {learnResult.reply}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Brand Protection Agent */}
        {activeTab === "brand" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Generative Brand Authority Shield — Hallucination Audit Engine</span>
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
                <div className={`space-y-4 p-4 rounded border ${
                  brandResult.hallucination_detected 
                    ? "bg-rose-950/15 border-rose-500/25" 
                    : "bg-emerald-950/15 border-emerald-500/25"
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest font-mono flex items-center space-x-1.5 ${
                    brandResult.hallucination_detected ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {brandResult.hallucination_detected ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Hallucination Detected</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Factual Alignment Verified</span>
                      </>
                    )}
                  </span>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Source Assistant</span>
                      <span className="text-slate-300 font-bold">{brandResult.audit_detail?.ai_assistant || "perplexity.ai"}</span>
                    </div>
                    {brandResult.hallucination_detected ? (
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block uppercase">Unverified / Incorrect Claim</span>
                        <p className="text-rose-300 font-mono leading-relaxed mt-0.5">"{brandResult.audit_detail?.incorrect_claim}"</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block uppercase">Audit Verdict</span>
                        <p className="text-emerald-300 font-mono leading-relaxed mt-0.5">Zero unverified claims detected. Public AI answers align with ISO 3585 and enterprise scientific specifications.</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase">Grounded Target Specification</span>
                      <p className="text-emerald-400 font-mono leading-relaxed mt-0.5">"{brandResult.audit_detail?.grounded_specification}"</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-muted/20 border border-border p-4 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Compiled JSON-LD Schema Grounding Patch</span>
                    </span>
                    <pre className="text-[10px] text-indigo-400 font-mono mt-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {brandResult.compiled_schema ? JSON.stringify(brandResult.compiled_schema, null, 2) : "// No schema patch needed — content is fully consistent."}
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

        {/* Tab 7: Competitive Pricing Override Agent */}
        {activeTab === "price" && (
          <div className="space-y-6 text-xs font-sans">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center space-x-1.5 border-b border-border/40 pb-3">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span>Catalog Pricing Competitor Sync Engine</span>
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
