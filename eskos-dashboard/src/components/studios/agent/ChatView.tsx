"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { Send, ArrowRight } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

interface Message {
  role: string;
  content: string;
  citations?: string[];
  loading?: boolean;
}

const WELCOME = {
  role: "assistant",
  content: "👋 Hello! I'm the ESKOS AI Product Assistant, powered by Gemini and grounded in Goel Scientific's real product knowledge base.\n\nAsk me anything about laboratory glassware — condensers, beakers, flasks, filtration systems — and I'll retrieve the exact specifications from the Knowledge Fabric before answering.",
  citations: [],
};

const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const currentQuery = input;
    const userMsg = { role: "user", content: currentQuery };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "", loading: true }]);

    const activeTenant = typeof window !== "undefined" 
      ? localStorage.getItem("eskos-active-tenant") || "goel-scientific"
      : "goel-scientific";

    try {
      const res = await fetch(`${KONG_URL}/api/v1/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-eskos-org-id": activeTenant,
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          message: currentQuery,
          session_id: sessionId
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || "Server returned an error");
      }

      const data = await res.json();
      
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      const answer = data.reply || "I was unable to generate a response. Please try again.";
      const citations = data.tool_calls ? data.tool_calls.map((t: any) => t.name || t) : [];
      const trace = data.trace || [];
      const cost = data.cost || undefined;

      setMessages((prev) => [
        ...prev.filter((m) => !m.loading),
        { role: "assistant", content: answer, citations, trace, cost },
      ]);
    } catch (err: any) {
      console.error("Chat error", err);
      setMessages((prev) => [
        ...prev.filter((m) => !m.loading),
        { role: "assistant", content: `❌ Error: ${err.message}`, citations: [] },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What condensers does Goel Scientific make?",
    "What is the thermal shock limit of the Allihn Condenser?",
    "Compare the Allihn and Liebig condensers",
    "What applications are desiccators used for?",
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2 border-b border-border/60">
        <div className="flex items-center space-x-3">
          <h1 className="text-sm font-semibold text-slate-100 font-sans tracking-wide">AI Knowledge Assistant</h1>
          <DataStateBadge state="live" />
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground bg-card hover:bg-muted hover:text-foreground transition-all cursor-pointer font-sans"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-6 border-t border-border bg-card">
        <div className="flex items-end space-x-3 max-w-4xl mx-auto border border-border rounded-lg bg-background p-2.5 shadow-sm">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about laboratory equipment or scientific products..."
            className="flex-1 max-h-32 bg-transparent text-sm text-foreground outline-none resize-none border-none focus:ring-0 placeholder:text-muted-foreground font-sans py-1"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
