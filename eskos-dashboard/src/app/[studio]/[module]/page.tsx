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

interface PageProps {
  params: Promise<{
    studio: string;
    module: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { studio, module } = await params;

  if (studio === "knowledge") {
    switch (module) {
      case "dashboard":
        return <DashboardView />;
      case "explorer":
        return <ExplorerView />;
      case "metadata":
        return <MetadataView />;
      case "ontology":
        return <OntologyView />;
      case "graph":
        return <GraphView />;
      case "chunks":
        return <ChunkView />;
      case "embeddings":
        return <EmbeddingView />;
      case "trust":
        return <TrustView />;
      case "search":
        return <SearchView />;
      case "version-control":
        return <VersionView />;
      case "gap-analysis":
        return <GapView />;
      default:
        notFound();
    }
  }

  if (studio === "agent") {
    switch (module) {
      case "chat":
        return <ChatView />;
      case "planner":
        return <PlannerView />;
      case "workflows":
        return <WorkflowBuilderView />;
      case "tools":
        return <ToolRegistryView />;
      case "prompts":
        return <PromptRegistryView />;
      case "memory":
        return <MemoryInspectorView />;
      case "monitoring":
        return <AgentMonitoringView />;
      case "cost-analytics":
        return <CostAnalyticsView />;
      default:
        notFound();
    }
  }

  if (studio === "governance") {
    switch (module) {
      case "review-queue":
        return <ReviewQueueView />;
      case "provenance":
        return <ProvenanceView />;
      case "citations":
        return <CitationsView />;
      case "audit-trail":
        return <AuditTrailView />;
      case "compliance":
        return <ComplianceView />;
      default:
        notFound();
    }
  }

  if (studio === "marketing") {
    switch (module) {
      case "seo":
        return <SEOView />;
      case "geo":
        return <GEOView />;
      case "aeo":
        return <AEOView />;
      default:
        notFound();
    }
  }

  if (studio === "observability") {
    switch (module) {
      case "health":
        return <HealthView />;
      case "retrieval":
        return <RetrievalView />;
      default:
        notFound();
    }
  }

  if (studio === "executive") {
    switch (module) {
      case "roi":
        return <ROIView />;
      case "coverage":
        return <CoverageView />;
      default:
        notFound();
    }
  }

  if (studio === "admin") {
    switch (module) {
      case "tenant-config":
        return <TenantConfigView />;
      case "api-keys":
        return <ApiKeysView />;
      default:
        notFound();
    }
  }

  if (studio === "home") {
    switch (module) {
      case "dashboard":
        return <HomeView />;
      default:
        notFound();
    }
  }

  return <FallbackView studio={studio} module={module} />;
}
