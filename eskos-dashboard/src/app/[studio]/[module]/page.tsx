import React from "react";
import { notFound } from "next/navigation";
import DashboardView from "@/components/studios/knowledge/DashboardView";
import ExplorerView from "@/components/studios/knowledge/ExplorerView";
import MetadataView from "@/components/studios/knowledge/MetadataView";
import OntologyView from "@/components/studios/knowledge/OntologyView";
import GraphView from "@/components/studios/knowledge/GraphView";
import ChunkView from "@/components/studios/knowledge/ChunkView";
import EmbeddingView from "@/components/studios/knowledge/EmbeddingView";
import TrustView from "@/components/studios/knowledge/TrustView";
import SearchView from "@/components/studios/knowledge/SearchView";
import VersionView from "@/components/studios/knowledge/VersionView";
import GapView from "@/components/studios/knowledge/GapView";
import ChatView from "@/components/studios/agent/ChatView";
import PlannerView from "@/components/studios/agent/PlannerView";
import WorkflowBuilderView from "@/components/studios/agent/WorkflowBuilderView";
import ToolRegistryView from "@/components/studios/agent/ToolRegistryView";
import PromptRegistryView from "@/components/studios/agent/PromptRegistryView";
import MemoryInspectorView from "@/components/studios/agent/MemoryInspectorView";
import AgentMonitoringView from "@/components/studios/agent/AgentMonitoringView";
import CostAnalyticsView from "@/components/studios/agent/CostAnalyticsView";
import ReviewQueueView from "@/components/studios/governance/ReviewQueueView";
import ProvenanceView from "@/components/studios/governance/ProvenanceView";
import CitationsView from "@/components/studios/governance/CitationsView";
import AuditTrailView from "@/components/studios/governance/AuditTrailView";
import ComplianceView from "@/components/studios/governance/ComplianceView";
import SEOView from "@/components/studios/marketing/SEOView";
import GEOView from "@/components/studios/marketing/GEOView";
import AEOView from "@/components/studios/marketing/AEOView";
import HealthView from "@/components/studios/observability/HealthView";
import RetrievalView from "@/components/studios/observability/RetrievalView";
import ROIView from "@/components/studios/executive/ROIView";
import CoverageView from "@/components/studios/executive/CoverageView";
import TenantConfigView from "@/components/studios/admin/TenantConfigView";
import ApiKeysView from "@/components/studios/admin/ApiKeysView";
import HomeView from "@/components/studios/home/HomeView";
import FallbackView from "@/components/studios/FallbackView";

import { AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{
    studio: string;
    module: string;
  }>;
}

const SIMULATED_MODULES = [
  "agent/planner",
  "agent/workflows",
  "agent/monitoring",
  "agent/cost-analytics",
  "governance/provenance",
  "governance/citations",
  "governance/compliance",
  "knowledge/embeddings",
  "knowledge/version-control",
  "marketing/geo",
  "marketing/aeo",
  "observability/retrieval",
  "executive/roi",
  "executive/coverage"
];

export default async function Page({ params }: PageProps) {
  const { studio, module } = await params;
  let view: React.ReactNode = null;

  if (studio === "knowledge") {
    switch (module) {
      case "dashboard":
        view = <DashboardView />;
        break;
      case "explorer":
        view = <ExplorerView />;
        break;
      case "metadata":
        view = <MetadataView />;
        break;
      case "ontology":
        view = <OntologyView />;
        break;
      case "graph":
        view = <GraphView />;
        break;
      case "chunks":
        view = <ChunkView />;
        break;
      case "embeddings":
        view = <EmbeddingView />;
        break;
      case "trust":
        view = <TrustView />;
        break;
      case "search":
        view = <SearchView />;
        break;
      case "version-control":
        view = <VersionView />;
        break;
      case "gap-analysis":
        view = <GapView />;
        break;
      default:
        notFound();
    }
  } else if (studio === "agent") {
    switch (module) {
      case "chat":
        view = <ChatView />;
        break;
      case "planner":
        view = <PlannerView />;
        break;
      case "workflows":
        view = <WorkflowBuilderView />;
        break;
      case "tools":
        view = <ToolRegistryView />;
        break;
      case "prompts":
        view = <PromptRegistryView />;
        break;
      case "memory":
        view = <MemoryInspectorView />;
        break;
      case "monitoring":
        view = <AgentMonitoringView />;
        break;
      case "cost-analytics":
        view = <CostAnalyticsView />;
        break;
      default:
        notFound();
    }
  } else if (studio === "governance") {
    switch (module) {
      case "review-queue":
        view = <ReviewQueueView />;
        break;
      case "provenance":
        view = <ProvenanceView />;
        break;
      case "citations":
        view = <CitationsView />;
        break;
      case "audit-trail":
        view = <AuditTrailView />;
        break;
      case "compliance":
        view = <ComplianceView />;
        break;
      default:
        notFound();
    }
  } else if (studio === "marketing") {
    switch (module) {
      case "seo":
        view = <SEOView />;
        break;
      case "geo":
        view = <GEOView />;
        break;
      case "aeo":
        view = <AEOView />;
        break;
      default:
        notFound();
    }
  } else if (studio === "observability") {
    switch (module) {
      case "health":
        view = <HealthView />;
        break;
      case "retrieval":
        view = <RetrievalView />;
        break;
      default:
        notFound();
    }
  } else if (studio === "executive") {
    switch (module) {
      case "roi":
        view = <ROIView />;
        break;
      case "coverage":
        view = <CoverageView />;
        break;
      default:
        notFound();
    }
  } else if (studio === "admin") {
    switch (module) {
      case "tenant-config":
        view = <TenantConfigView />;
        break;
      case "api-keys":
        view = <ApiKeysView />;
        break;
      default:
        notFound();
    }
  } else if (studio === "home") {
    switch (module) {
      case "dashboard":
        view = <HomeView />;
        break;
      default:
        notFound();
    }
  } else {
    view = <FallbackView studio={studio} module={module} />;
  }

  const isSimulated = SIMULATED_MODULES.includes(`${studio}/${module}`);

  if (isSimulated && view) {
    return (
      <div className="relative w-full h-full flex flex-col">
        {/* Premium Simulation Alert Ribbon */}
        <div className="bg-amber-500/5 border-b border-amber-500/10 px-6 py-2 flex items-center justify-between backdrop-blur-sm z-20 text-[11px] font-mono text-amber-400/90 select-none shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold tracking-wider uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Simulation Mode
            </span>
            <span className="text-amber-500/20">|</span>
            <span className="text-[10px] text-amber-400/60 font-sans">This module is currently populated with offline demonstration telemetry.</span>
          </div>
          <div className="px-2 py-0.5 rounded border border-amber-500/20 text-[9px] font-bold uppercase tracking-widest bg-amber-500/5">
            Simulated Data
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {view}
        </div>
      </div>
    );
  }

  return view;
}
