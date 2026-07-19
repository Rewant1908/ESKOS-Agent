"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Network, Activity, Info, Loader2 } from "lucide-react";
import DataStateBadge from "@/components/ui/DataStateBadge";

const NODE_COLORS: Record<string, string> = {
  product:     '#818cf8',
  material:    '#34d399',
  application: '#fb923c',
  standard:    '#facc15',
  document:    '#60a5fa',
  measurement: '#c084fc',
  chemical:    '#f472b6',
  organization:'#a3e635',
  person:      '#f43f5e',
  location:    '#06b6d4',
};

const KONG_URL = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000"
  : "http://localhost:8000";

interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  source: string;
  target: string;
  rel: string;
}

interface Neighbor {
  id: string;
  name: string;
  type: string;
  relationship: string;
}

export default function GraphView() {
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<Node | null>(null);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [loadingGraph, setLoadingGraph] = useState(true);
  
  const transform = useRef({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const nodeMap = useRef<Record<string, Node>>({});

  const fetchNeighbors = useCallback(async (entityId: string): Promise<Neighbor[]> => {
    try {
      const res = await fetch(`${KONG_URL}/api/v1/knowledge/entity/${encodeURIComponent(entityId)}/neighbors`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.neighbors || [];
    } catch (err) {
      console.error("Failed to fetch node adjacencies:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    const buildGraph = async () => {
      setLoadingGraph(true);
      try {
        const res = await fetch(`${KONG_URL}/api/v1/knowledge/graph`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (!res.ok) {
          throw new Error("Failed to retrieve live graph schema.");
        }
        const data = await res.json();
        
        const nodesArr: Node[] = (data.nodes || []).map((n: any) => ({
          id: n.id,
          label: n.name || n.id,
          type: n.type || "unknown",
          x: Math.random() * 800 - 400,
          y: Math.random() * 600 - 300,
          vx: 0,
          vy: 0
        }));

        const edgesArr: Edge[] = (data.edges || []).map((e: any) => ({
          source: e.source,
          target: e.target,
          rel: e.rel || ""
        }));

        nodeMap.current = Object.fromEntries(nodesArr.map(n => [n.id, n]));
        setNodes(nodesArr);
        setEdges(edgesArr);
      } catch (err) {
        console.error("Failed to load knowledge graph:", err);
      } finally {
        setLoadingGraph(false);
      }
    };
    buildGraph();
  }, []);

  useEffect(() => {
    const entity = searchParams.get('entity');
    if (entity && nodeMap.current[entity]) {
      setSelected(nodeMap.current[entity]);
      fetchNeighbors(entity).then(setNeighbors);
    }
  }, [searchParams, nodes, fetchNeighbors]);

  // Force-directed layout physics loop
  useEffect(() => {
    if (nodes.length === 0) return;
    let running = true;

    const tick = () => {
      if (!running) return;
      setNodes((prev) => {
        const next = prev.map(n => ({ ...n }));
        const map = Object.fromEntries(next.map(n => [n.id, n]));

        // Repel forces between all node pairs (charge)
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i], b = next[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const rawDist = Math.sqrt(dx * dx + dy * dy) || 1;
            // Guard against divide-by-zero or extreme spikes when nodes are close
            const dist = Math.max(rawDist, 40);
            const force = 4000 / (dist * dist);
            const fx = (dx / rawDist) * force, fy = (dy / rawDist) * force;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }

        // Pull forces along edges (gravity/links)
        for (const e of edges) {
          const a = map[e.source], b = map[e.target];
          if (!a || !b) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 140) * 0.025; // Softer spring pull
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }

        // Center gravity and velocity damping (friction)
        const MAX_VELOCITY = 3; // Strict cap to prevent rapid jittering
        for (const n of next) {
          n.vx = (n.vx - n.x * 0.006) * 0.72; // Increased friction damping
          n.vy = (n.vy - n.y * 0.006) * 0.72;
          
          const vel = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (vel > MAX_VELOCITY) {
            n.vx = (n.vx / vel) * MAX_VELOCITY;
            n.vy = (n.vy / vel) * MAX_VELOCITY;
          }
          n.x += n.vx; n.y += n.vy;
        }

        nodeMap.current = Object.fromEntries(next.map(n => [n.id, n]));
        return next;
      });

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { 
      running = false; 
      if (animRef.current) cancelAnimationFrame(animRef.current); 
    };
  }, [nodes.length, edges]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const { x, y, scale } = transform.current;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.scale(scale, scale);

    // Draw relation lines/edges
    ctx.lineWidth = 1.2;
    for (const e of edges) {
      const a = nodeMap.current[e.source], b = nodeMap.current[e.target];
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      // Faint visible relationship paths
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.stroke();
    }

    // Draw entity nodes
    for (const n of nodes) {
      const color = NODE_COLORS[n.type] || '#94a3b8';
      const isSelected = selected?.id === n.id;
      const r = n.type === 'document' ? 14 : 9;

      if (isSelected) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw labels
      ctx.font = `${isSelected ? '700' : '400'} ${r < 12 ? 9 : 10}px Geist, sans-serif`;
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(248, 250, 252, 0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(n.label.slice(0, 24), n.x, n.y + r + 13);
    }
    ctx.restore();
  }, [nodes, edges, selected]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - canvas.width / 2 - transform.current.x) / transform.current.scale;
    const my = (e.clientY - rect.top - canvas.height / 2 - transform.current.y) / transform.current.scale;
    
    for (const n of Object.values(nodeMap.current)) {
      const dx = n.x - mx, dy = n.y - my;
      if (Math.sqrt(dx*dx + dy*dy) < 18) {
        setSelected(n);
        fetchNeighbors(n.id).then(setNeighbors);
        return;
      }
    }
    setSelected(null); 
    setNeighbors([]);
  }, [fetchNeighbors]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    transform.current.scale = Math.max(0.3, Math.min(3, transform.current.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX - transform.current.x, y: e.clientY - transform.current.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging.current && dragStart.current) {
      transform.current.x = e.clientX - dragStart.current.x;
      transform.current.y = e.clientY - dragStart.current.y;
    }
  };

  const handleMouseUp = () => { dragging.current = false; };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between px-6 h-12 bg-card/60 border-b border-border select-none z-10">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">Knowledge Graph Explorer</h2>
          <DataStateBadge state="live" />
          <span className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded border border-border">
            {nodes.length} nodes &middot; {edges.length} edges
          </span>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center space-x-3 text-[10px]">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-1.5 font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground uppercase">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative bg-[#070a10]">
        {loadingGraph ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 select-none">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <span className="text-xs text-muted-foreground font-mono tracking-widest">QUERYING LIVE GRAPH DATABASES...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />
        )}

        {/* Selection Inspector */}
        {selected && (
          <div className="absolute top-4 right-4 w-80 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 z-20 flex flex-col space-y-4 max-h-[85%] overflow-y-auto">
            <div>
              <div className="flex items-center space-x-2 text-muted-foreground text-[10px] font-mono uppercase">
                <Info className="w-3 h-3 text-primary" />
                <span>Selected Entity</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mt-1 select-text font-sans">{selected.label}</h3>
              <span 
                className="inline-block mt-2 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-current font-sans"
                style={{ color: NODE_COLORS[selected.type] || '#aaa' }}
              >
                {selected.type}
              </span>
            </div>

            {/* Adjacencies list */}
            <div className="space-y-2 border-t border-border pt-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Adjacency Matrix ({neighbors.length})
              </span>
              {neighbors.length === 0 ? (
                <p className="text-[10px] text-muted-foreground font-sans">No adjacent connections found in Graph.</p>
              ) : (
                <ul className="space-y-1.5 font-mono text-[10px] text-muted-foreground">
                  {neighbors.slice(0, 10).map((n, i) => (
                    <li key={i} className="flex justify-between items-center p-1.5 rounded bg-muted/20 border border-border select-text">
                      <span className="text-primary text-[8px] uppercase font-bold">{n.relationship}</span>
                      <span className="text-slate-300 font-sans max-w-[65%] truncate">{n.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
