"use client";

import React from "react";
import { User, Cpu, FileText } from "lucide-react";

interface Message {
  role: string;
  content: string;
  citations?: string[];
  loading?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, citations = [], loading } = message;
  const isUser = role === "user";

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
        </div>
      </div>
    </div>
  );
}
