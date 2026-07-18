"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileSearch, Binary, Compass, Network,
  Layers, ScatterChart, Shield, SearchCode, GitBranch, AlertCircle,
  MessageSquare, Cpu, Workflow, Wrench, Terminal, BrainCircuit,
  Activity, CircleDollarSign, ListChecks, ClipboardCheck, History,
  FileBadge, Users, Key, ChevronLeft, ChevronRight, Pin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const modules = MODULES_MAP[currentStudio] || [];

  if (modules.length === 0) {
    return null; // Don't render sidebar if no module mappings exist (e.g. for landing or home views)
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 68 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="bg-card/30 border-r border-border/80 flex flex-col h-full select-none relative z-20 glass-panel"
    >
      {/* Scrollable navigation container */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center space-x-1">
            <Pin className="w-2.5 h-2.5" />
            <span>Studio Modules</span>
          </div>
        )}

        {modules.map((item) => {
          const Icon = item.icon;
          const href = `/${currentStudio}/${item.id}`;
          const isActive = pathname === href;

          return (
            <Link key={item.id} href={href} className="relative block group">
              <div
                className={`flex items-center space-x-3 px-3 h-10 rounded-lg transition-all text-xs font-semibold font-sans relative border ${
                  isActive
                    ? "bg-muted/65 border-border/80 text-primary-foreground font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-muted/20"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-primary scale-110" : "text-slate-500 group-hover:scale-105"}`} />
                
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* active status indicator dot on collapsed mode */}
                {isActive && isCollapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Collapse controls at footer */}
      <div className="p-3 border-t border-border/40 flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 bg-muted/40 border border-border/80 rounded-lg hover:border-slate-700/60 text-muted-foreground hover:text-slate-200 transition-all cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
