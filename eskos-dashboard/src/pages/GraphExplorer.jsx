import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';

const FABRIC_URL = import.meta.env.VITE_FABRIC_URL;

const NODE_COLORS = {
  product:     '#6c63ff',
  material:    '#00d4aa',
  application: '#ffa94d',
  standard:    '#ffd43b',
  document:    '#74c0fc',
  measurement: '#da77f2',
  chemical:    '#f783ac',
  organization:'#a9e34b',
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

function GraphContent() {
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [neighbors, setNeighbors] = useState([]);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const transform = useRef({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(null);
  const dragStart = useRef(null);
  const nodeMap = useRef({});

  const fetchNeighbors = useCallback(async (entityId) => {
    try {
      const res = await fetch(`${FABRIC_URL}/api/v1/knowledge/entity/${encodeURIComponent(entityId)}/neighbors`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      return data.neighbors || [];
    } catch { return []; }
  }, []);

  // Build full graph from all seed entities
  useEffect(() => {
    const build = async () => {
      setLoadingGraph(true);
      const allNodes = new Map();
      const allEdges = [];

      const addNode = (id, label, type) => {
        if (!allNodes.has(id)) {
          allNodes.set(id, { id, label, type,
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

  // Check URL param for pre-selected entity
  useEffect(() => {
    const entity = searchParams.get('entity');
    if (entity && nodeMap.current[entity]) {
      setSelected(nodeMap.current[entity]);
    }
  }, [searchParams, nodes]);

  // Force simulation
  useEffect(() => {
    if (nodes.length === 0) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      setNodes(prev => {
        const next = prev.map(n => ({ ...n }));
        const map = Object.fromEntries(next.map(n => [n.id, n]));
        // Repulsion
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
        // Attraction
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
        // Damping + center
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
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [nodes.length, edges]);

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const { x, y, scale } = transform.current;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.scale(scale, scale);

    // Edges
    ctx.lineWidth = 1;
    for (const e of edges) {
      const a = nodeMap.current[e.source], b = nodeMap.current[e.target];
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.stroke();
    }

    // Nodes
    for (const n of nodes) {
      const color = NODE_COLORS[n.type] || '#aaa';
      const isSelected = selected?.id === n.id;
      const r = n.type === 'document' ? 14 : 10;

      // Glow if selected
      if (isSelected) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.font = `${isSelected ? 700 : 400} ${r < 12 ? 9 : 10}px Inter`;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(n.label.slice(0, 20), n.x, n.y + r + 12);
    }
    ctx.restore();
  }, [nodes, edges, selected]);

  // Click to select node
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
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
    setSelected(null); setNeighbors([]);
  }, [fetchNeighbors]);

  const handleWheel = (e) => {
    transform.current.scale = Math.max(0.3, Math.min(3, transform.current.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
  };
  const handleMouseDown = (e) => { dragging.current = true; dragStart.current = { x: e.clientX - transform.current.x, y: e.clientY - transform.current.y }; };
  const handleMouseMove = (e) => { if (dragging.current) { transform.current.x = e.clientX - dragStart.current.x; transform.current.y = e.clientY - dragStart.current.y; } };
  const handleMouseUp = () => { dragging.current = false; };

  const legendEntries = Object.entries(NODE_COLORS);

  return (
    <div className="graph-page">
      <div className="graph-toolbar">
        <strong style={{ fontSize: '1rem' }}>🕸️ Knowledge Graph Explorer</strong>
        <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{nodes.length} nodes · {edges.length} edges</span>
        <div className="graph-legend">
          {legendEntries.map(([type, color]) => (
            <div key={type} className="legend-item">
              <div className="legend-dot" style={{ background: color }} />
              {type}
            </div>
          ))}
        </div>
      </div>

      <div className="graph-container">
        {loadingGraph ? (
          <div className="loading-dots" style={{ paddingTop: '6rem' }}><span /><span /><span /></div>
        ) : (
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight - 120}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: 'grab', display: 'block' }}
          />
        )}

        {selected && (
          <div className="graph-info-panel">
            <div className="info-panel-title">Selected Node</div>
            <div className="info-entity-name">{selected.label}</div>
            <span
              className="info-entity-type"
              style={{
                background: `${NODE_COLORS[selected.type] || '#aaa'}18`,
                color: NODE_COLORS[selected.type] || '#aaa',
                border: `1px solid ${NODE_COLORS[selected.type] || '#aaa'}44`,
              }}
            >
              {selected.type}
            </span>

            {neighbors.length > 0 && (
              <>
                <div className="info-panel-title">Relationships ({neighbors.length})</div>
                <ul className="neighbors-list">
                  {neighbors.slice(0, 8).map((n, i) => (
                    <li key={i} className="neighbor-item">
                      <span className="neighbor-rel">{n.relationship}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '.82rem' }}>{n.name}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GraphExplorer() {
  return (
    <Suspense fallback={<div className="loading-dots" style={{paddingTop:'6rem'}}><span/><span/><span/></div>}>
      <GraphContent />
    </Suspense>
  );
}
