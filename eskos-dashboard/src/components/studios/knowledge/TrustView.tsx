"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Sliders, Check, Info, Loader2, AlertTriangle, CheckCircle, RefreshCw, Layers } from "lucide-react";

interface Weights {
  source_authority: number;
  freshness: number;
  scientific_references: number;
  reviewer_approval: number;
  metadata_completeness: number;
  consistency: number;
  version_validity: number;
  enterprise_ownership: number;
}

interface SourceTrust {
  [key: string]: number;
}

export default function TrustView() {
  const [weights, setWeights] = useState<Weights | null>(null);
  const [sourceTrust, setSourceTrust] = useState<SourceTrust | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab control: "weights" | "sources"
  const [activeTab, setActiveTab] = useState<"weights" | "sources">("weights");

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const KONG_URL = typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
    : "http://localhost:8000";

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/trust-score/config`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Failed to load trust config registry.");
      const data = await res.json();
      setWeights(data.weights);
      setSourceTrust(data.source_trust);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load trust engine configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleWeightChange = (key: keyof Weights, value: number) => {
    if (!weights) return;
    setWeights(prev => ({
      ...prev!,
      [key]: parseFloat((value / 100).toFixed(3))
    }));
    setSaveSuccess(false);
    setValidationError(null);
  };

  const handleSourceTrustChange = (key: string, value: number) => {
    if (!sourceTrust) return;
    setSourceTrust(prev => ({
      ...prev!,
      [key]: value
    }));
    setSaveSuccess(false);
    setValidationError(null);
  };

  // Compute weight percentage sum
  const weightsPercentageSum = weights
    ? Object.values(weights).reduce((sum, w) => sum + Math.round(w * 100), 0)
    : 0;

  const isSumValid = Math.abs(weightsPercentageSum - 100) <= 1;

  const handleSaveConfig = async () => {
    if (!weights || !sourceTrust) return;
    setValidationError(null);
    setSaveSuccess(false);

    if (!isSumValid) {
      setValidationError(`Weights must sum to exactly 100%. Current sum: ${weightsPercentageSum}%`);
      return;
    }

    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/trust-score/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weights,
          source_trust: sourceTrust
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save trust configurations.");
      }

      setSaveSuccess(true);
      await fetchConfig();
    } catch (err: any) {
      setValidationError(err.message);
    }
  };

  if (loading && !weights) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground select-none">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Connecting to Trust Engine...
        </span>
      </div>
    );
  }

  // Tiers for grouping source trust
  const sourceGroups = {
    "Tier 1: Internal Enterprise": ["internal_approved_manual", "erp", "engineering_database", "internal_sop", "laboratory_report"],
    "Tier 2: Scientific Standards": ["astm", "iso", "government_standard", "peer_reviewed_journal", "university"],
    "Tier 3: Business Intelligence": ["manufacturer_website", "distributor_website", "competitor_website", "marketplace_listing"],
    "Tier 4: Public Internet": ["industry_blog", "forum", "unknown_website", "ai_generated_article"]
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 font-sans tracking-wide">Trust Center</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Configure credibility weights and source grading matrices used during retrieval ranking.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Tab switches */}
          <div className="bg-card border border-border rounded p-0.5 flex items-center text-xs font-mono text-muted-foreground mr-2">
            <button
              onClick={() => setActiveTab("weights")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === "weights" ? "bg-primary text-white font-semibold" : "hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Grader Weights</span>
            </button>
            <button
              onClick={() => setActiveTab("sources")}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-all cursor-pointer ${
                activeTab === "sources" ? "bg-primary text-white font-semibold" : "hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Source Authority</span>
            </button>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={!isSumValid}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-all cursor-pointer font-sans ${
              isSumValid
                ? "bg-primary hover:bg-primary/95 text-white"
                : "bg-slate-800 text-slate-500 border border-border cursor-not-allowed"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Config</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Settings Workspace (Left) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Status Alert Panels */}
          {validationError && (
            <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-start space-x-3 text-red-400 font-sans text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-bold">Configuration Validation Fault</p>
                <p className="mt-1 font-mono text-[10px]">{validationError}</p>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center space-x-3 text-emerald-400 text-xs font-sans">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Configuration successfully committed to memory database (Redis).</span>
            </div>
          )}

          {/* Tab 1: Weights */}
          {activeTab === "weights" && weights && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Trust Decision Matrix</h3>
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-muted-foreground">Allocation Sum:</span>
                  <span className={`font-bold ${isSumValid ? "text-emerald-400" : "text-amber-400"}`}>
                    {weightsPercentageSum}% / 100%
                  </span>
                </div>
              </div>

              <div className="space-y-5 text-xs">
                {Object.entries(weights).map(([key, val]) => {
                  const percent = Math.round(val * 100);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-primary font-bold">{percent}%</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={percent}
                          onChange={(e) => handleWeightChange(key as keyof Weights, parseInt(e.target.value))}
                          className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Source Trust Grader */}
          {activeTab === "sources" && sourceTrust && (
            <div className="space-y-6">
              {Object.entries(sourceGroups).map(([groupTitle, categories]) => (
                <div key={groupTitle} className="bg-card border border-border rounded-lg p-5 space-y-4">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono border-b border-border pb-2 block">
                    {groupTitle}
                  </span>
                  <div className="space-y-4 text-xs font-mono">
                    {categories.map((catKey) => {
                      const score = sourceTrust[catKey] ?? 0;
                      return (
                        <div key={catKey} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300 capitalize">{catKey.replace(/_/g, " ")}</span>
                            <span className="text-primary font-bold">{score}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => handleSourceTrustChange(catKey, parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Sidebar Status (Right) */}
        <div className="space-y-6">
          
          {/* Trust System status indicator */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Trust System Status</h3>
            </div>
            
            <div className="space-y-3 font-mono text-[10px] text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Dynamic Weight Allocation:</span>
                <span className="text-emerald-400 font-semibold uppercase bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Redis Persistence Cache:</span>
                <span className="text-emerald-400 font-semibold uppercase bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Spacy Parser / Pipeline:</span>
                <span className="text-emerald-400 font-semibold uppercase bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  healthy
                </span>
              </div>
            </div>
          </div>

          {/* Quick Start Help */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 font-sans text-xs">
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">Trust Weight Guidelines</span>
            <p className="text-muted-foreground leading-relaxed">
              The Enterprise Trust Score drives how ESKOS indexes and prioritizes knowledge. 
            </p>
            <ul className="list-disc pl-4 text-muted-foreground space-y-1.5">
              <li>**Source Authority**: Weight given to the credibility grade of the category (configured in Source Authority tab).</li>
              <li>**Freshness**: Gradually penalizes older documents (half-life decay rate of 2 years).</li>
              <li>**Reviewer Approval**: Grants a baseline boost if review metadata matches.</li>
            </ul>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded flex items-center space-x-2 text-[10px] text-primary">
              <Info className="w-4 h-4 shrink-0" />
              <span>Weight changes are immediately evaluated in RAG retrieval query pipelines.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
