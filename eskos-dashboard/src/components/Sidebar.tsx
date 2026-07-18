"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileSearch, Binary, Compass, Network,
  Layers, ScatterChart, Shield, SearchCode, GitBranch, AlertCircle,
  MessageSquare, Cpu, Workflow, Wrench, Terminal, BrainCircuit,
  Activity, CircleDollarSign, ListChecks, ClipboardCheck, History,
  FileBadge, Users, Key
} from "lucide-react";

interface SidebarProps {
  currentStudio: string;
}

interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

const MODULES_MAP: Record<string, NavItem[]> = {
  knowledge: [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "explorer", name: "Knowledge Explorer", icon: FileSearch },
    { id: "metadata", name: "Metadata Manager", icon: Binary },
    { id: "ontology", name: "Ontology Manager", icon: Compass },
    { id: "graph", name: "Knowledge Graph", icon: Network },
    { id: "chunks", name: "Chunk Explorer", icon: Layers },
    { id: "embeddings", name: "Embedding Explorer", icon: ScatterChart },
    { id: "trust", name: "Trust Center", icon: Shield },
    { id: "search", name: "Search Studio", icon: SearchCode },
    { id: "version-control", name: "Version Control", icon: GitBranch },
    { id: "gap-analysis", name: "Gap Analysis", icon: AlertCircle },
  ],
  agent: [
    { id: "chat", name: "AI Chatbot", icon: MessageSquare },
    { id: "planner", name: "Planner", icon: Cpu },
    { id: "workflows", name: "Workflow Builder", icon: Workflow },
    { id: "tools", name: "Tool Registry", icon: Wrench },
    { id: "prompts", name: "Prompt Registry", icon: Terminal },
    { id: "memory", name: "Memory Inspector", icon: BrainCircuit },
    { id: "monitoring", name: "Agent Monitoring", icon: Activity },
    { id: "cost-analytics", name: "Cost Analytics", icon: CircleDollarSign },
  ],
  governance: [
    { id: "review-queue", name: "Review Queue", icon: ListChecks },
    { id: "provenance", name: "Provenance Explorer", icon: ClipboardCheck },
    { id: "citations", name: "Citation Viewer", icon: FileSearch },
    { id: "audit-trail", name: "Audit Explorer", icon: History },
    { id: "compliance", name: "Compliance Dashboard", icon: FileBadge },
  ],
  marketing: [
    { id: "seo", name: "SEO Intelligence", icon: Activity },
    { id: "geo", name: "GEO Intelligence", icon: Compass },
    { id: "aeo", name: "AEO Intelligence", icon: SearchCode },
  ],
  observability: [
    { id: "health", name: "System Health", icon: Activity },
    { id: "retrieval", name: "Retrieval Analytics", icon: Layers },
  ],
  executive: [
    { id: "roi", name: "ROI Analytics", icon: CircleDollarSign },
    { id: "coverage", name: "Coverage Maps", icon: LayoutDashboard },
  ],
  admin: [
    { id: "tenant-config", name: "Tenant Settings", icon: Users },
    { id: "api-keys", name: "API Config", icon: Key },
  ],
};

export default function Sidebar({ currentStudio }: SidebarProps) {
  const pathname = usePathname();
  const modules = MODULES_MAP[currentStudio] || [];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full select-none">
      {/* Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Studio Navigation
        </div>
        {modules.map((item) => {
          const Icon = item.icon;
          const href = `/${currentStudio}/${item.id}`;
          const isActive = pathname === href;

          return (
            <Link
              key={item.id}
              href={href}
              className={`flex items-center space-x-3 px-3 h-10 rounded-md transition-all text-xs font-medium ${
                isActive
                  ? "bg-muted text-foreground font-semibold shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
