"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Network, Activity, Info } from "lucide-react";

const NODE_COLORS: Record<string, string> = {
  product:     '#818cf8',
  material:    '#34d399',
  application: '#fb923c',
  standard:    '#facc15',
  document:    '#60a5fa',
  measurement: '#c084fc',
  chemical:    '#f472b6',
  organization:'#a3e635',
};

const SEED_ENTITIES = [
  'doc:goel-allihn-condenser-300',
  'doc:aspirator_bottles',
  'doc:bell_jar',
  'doc:coil_condenser',
  'doc:desiccators',
  'doc:extractors',
  'doc:glass_beaker',
  'doc:glass_flask',
  'doc:goel-liebig-condenser-250',
  'doc:micro_filteration_assembly',
];

const KONG_URL = process.env.NEXT_PUBLIC_KONG_URL || "http://localhost:8000";

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
    } catch { 
      return []; 
    }
  }, []);

  useEffect(() => {
    const build = async () => {
      setLoadingGraph(true);
      const allNodes = new Map<string, Node>();
      const allEdges: Edge[] = [];

      const addNode = (id: string, label: string, type: string) => {
        if (!allNodes.has(id)) {
          allNodes.set(id, { 
            id, label, type,
            x: Math.random() * 800 - 400,
            y: Math.random() * 600 - 300,
            vx: 0, vy: 0
          });
        }
      };

      for (const entityId of SEED_ENTITIES) {
        const parts = entityId.split(':');
        addNode(entityId, parts.slice(1).join(':').replace(/_/g,' '), parts[0]);
        const nbrs = await fetchNeighbors(entityId);
        for (const n of nbrs) {
          const ntype = n.id ? n.id.split(':')[0] : n.type;
          addNode(n.id, n.name, ntype || n.type);
          allEdges.push({ source: entityId, target: n.id, rel: n.relationship });
        }
      }

      const nodesArr = Array.from(allNodes.values());
      nodeMap.current = Object.fromEntries(nodesArr.map(n => [n.id, n]));
      setNodes(nodesArr);
      setEdges(allEdges);
      setLoadingGraph(false);
    };
    build();
  }, [fetchNeighbors]);

  useEffect(() => {
    const entity = searchParams.get('entity');
    if (entity && nodeMap.current[entity]) {
      setSelected(nodeMap.current[entity]);
    }
  }, [searchParams, nodes]);

  useEffect(() => {
    if (nodes.length === 0) return;
    let running = true;

    const tick = () => {
      if (!running) return;
      setNodes((prev) => {
        const next = prev.map(n => ({ ...n }));
        const map = Object.fromEntries(next.map(n => [n.id, n]));

        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i], b = next[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 8000 / (dist * dist);
            const fx = (dx / dist) * force, fy = (dy / dist) * force;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }

        for (const e of edges) {
          const a = map[e.source], b = map[e.target];
          if (!a || !b) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 120) * 0.03;
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }

        for (const n of next) {
          n.vx = (n.vx - n.x * 0.01) * 0.85;
          n.vy = (n.vy - n.y * 0.01) * 0.85;
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

    ctx.lineWidth = 1;
    for (const e of edges) {
      const a = nodeMap.current[e.source], b = nodeMap.current[e.target];
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();
    }

    for (const n of nodes) {
      const color = NODE_COLORS[n.type] || '#94a3b8';
      const isSelected = selected?.id === n.id;
      const r = n.type === 'document' ? 14 : 9;

      if (isSelected) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = `${isSelected ? '700' : '400'} ${r < 12 ? 9 : 10}px Geist, sans-serif`;
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(248, 250, 252, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(n.label.slice(0, 20), n.x, n.y + r + 12);
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
      if (Math.sqrt(dx*dx + dy*dy) < 16) {
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
      <div className="flex items-center justify-between px-6 h-12 bg-card/60 border-b border-border select-none z-10">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">Knowledge Graph Explorer</h2>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded border border-border">
            {nodes.length} nodes &middot; {edges.length} edges
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-3 text-[10px]">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-1.5 font-mono">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground uppercase">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative bg-[#070a10]">
        {loadingGraph ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <Activity className="w-8 h-8 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">RETRIEVING GRAPH DATA...</span>
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

            {neighbors.length > 0 && (
              <div className="space-y-2 border-t border-border pt-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Adjacencies ({neighbors.length})</span>
                <ul className="space-y-1.5 font-mono text-[10px] text-muted-foreground">
                  {neighbors.slice(0, 8).map((n, i) => (
                    <li key={i} className="flex justify-between items-center p-1.5 rounded bg-muted/20 border border-border select-text">
                      <span className="text-primary text-[9px] uppercase font-semibold">{n.relationship}</span>
                      <span className="text-slate-300 font-sans max-w-[65%] truncate">{n.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
