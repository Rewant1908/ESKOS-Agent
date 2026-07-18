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
      default:
        return <FallbackView studio={studio} module={module} />;
    }
  }

  return <FallbackView studio={studio} module={module} />;
}
