"use client";

import React, { useState } from "react";
import { User, Cpu, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface TraceStep {
  agent: "planner" | "researcher" | "compliance";
  action: string;
  message?: string;
  timestamp: string;
}

interface CostMetric {
  inputTokens: number;
  outputTokens: number;
  usd: number;
}

interface Message {
  role: string;
  content: string;
  citations?: string[];
  loading?: boolean;
  trace?: TraceStep[];
  cost?: CostMetric;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, citations = [], loading } = message;
  const isUser = role === "user";
  const [showTrace, setShowTrace] = useState(false);

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4 select-text`}>
      <div className={`flex space-x-3 max-w-[80%] ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-slate-800 border border-border text-slate-300"
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col">
          <div className={`px-4 py-3 rounded-lg text-sm leading-relaxed ${
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "bg-card border border-border text-slate-100 rounded-tl-none"
          }`}>
            {loading ? (
              <div className="flex space-x-1.5 py-1 justify-center items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap font-sans">{content}</p>
            )}
          </div>

          {/* Citations / Tool calls */}
          {!loading && citations.length > 0 && (
            <div className="flex flex-wrap items-center mt-2 gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              <span className="mr-1">Retrieved:</span>
              {citations.map((c, i) => (
                <span key={i} className="flex items-center space-x-1 border border-border px-2 py-0.5 rounded bg-muted/30">
                  <FileText className="w-3 h-3 text-primary" />
                  <span>{c}</span>
                </span>
              ))}
            </div>
          )}

          {/* Collapsible Trace Steps */}
          {!loading && message.trace && message.trace.length > 0 && (
            <div className="mt-2 text-xs font-mono border border-border rounded bg-muted/10 p-2 max-w-lg">
              <button 
                onClick={() => setShowTrace(!showTrace)} 
                className="flex items-center justify-between w-full text-[9px] text-muted-foreground hover:text-slate-200 transition-colors uppercase font-bold tracking-wider cursor-pointer"
              >
                <span>Multi-Agent Trace ({message.trace.length} steps)</span>
                {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showTrace && (
                <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5 max-h-48 overflow-y-auto">
                  {message.trace.map((step, idx) => {
                    let iconColor = "text-primary";
                    if (step.agent === "compliance") iconColor = "text-emerald-400";
                    if (step.agent === "researcher") iconColor = "text-indigo-400";

                    return (
                      <div key={idx} className="flex flex-col p-1.5 rounded bg-muted/20 border border-border/20">
                        <div className="flex justify-between text-[9px] font-bold">
                          <span className={iconColor}>{step.agent.toUpperCase()} &rarr; {step.action}</span>
                          <span className="text-muted-foreground">{new Date(step.timestamp).toLocaleTimeString()}</span>
                        </div>
                        {step.message && (
                          <p className="text-[9px] text-slate-300 mt-1 leading-relaxed font-sans">{step.message}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Cost telemetry */}
          {!loading && message.cost && (
            <div className="mt-1.5 text-[9px] text-muted-foreground font-mono uppercase tracking-wider flex items-center space-x-2 select-none">
              <span>Input: {message.cost.inputTokens} tks</span>
              <span>&middot;</span>
              <span>Output: {message.cost.outputTokens} tks</span>
              <span>&middot;</span>
              <span className="text-primary font-bold">Cost: ${message.cost.usd.toFixed(6)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
