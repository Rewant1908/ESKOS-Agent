import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const FABRIC_URL = import.meta.env.VITE_FABRIC_URL;

const KNOWN_DOCS = [
  'goel-allihn-condenser-300',
  'aspirator_bottles',
  'bell_jar',
  'coil_condenser',
  'desiccators',
  'extractors',
  'glass_beaker',
  'glass_flask',
  'goel-liebig-condenser-250',
  'micro_filteration_assembly',
];

const SUGGESTIONS = [
  'condensers for solvent recovery',
  'thermal shock resistant equipment',
  'borosilicate glass lab equipment',
  'vacuum filtration systems',
  'distillation apparatus',
];

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load all docs on mount
  useEffect(() => {
    const fetchAll = async () => {
      const fetched = await Promise.all(
        KNOWN_DOCS.map(id =>
          fetch(`${FABRIC_URL}/api/v1/knowledge/document/${id}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );
      setAllDocs(fetched.filter(Boolean));
    };
    fetchAll();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${FABRIC_URL}/api/v1/knowledge/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ query, org_id: 'goel-scientific', rag_type: 'product', limit: 10 }),
      });
      const data = await res.json();
      // Extract unique doc IDs from vector hits
      const hits = data.vector_hits || [];
      const docIds = [...new Set(hits.map(h => h.parent_doc_id))];
      if (docIds.length > 0) {
        const docs = await Promise.all(
          docIds.map(id => fetch(`${FABRIC_URL}/api/v1/knowledge/document/${id}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }).then(r => r.ok ? r.json() : null).catch(() => null))
        );
        setResults(docs.filter(Boolean));
      } else {
        // Fallback: show all docs with fuzzy text match
        const q = query.toLowerCase();
        setResults(allDocs.filter(d =>
          (d.document_name || '').toLowerCase().includes(q) ||
          (d.material || '').toLowerCase().includes(q) ||
          (d.applications || []).some(a => a.toLowerCase().includes(q)) ||
          (d.product_category || '').toLowerCase().includes(q)
        ));
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const displayDocs = searched ? results : allDocs;

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="hero">
          <div className="hero-tag">✨ Powered by Gemini + Neo4j + Qdrant</div>
          <h1>Product Intelligence,<br />Reimagined with AI</h1>
          <p>Ask anything about Goel Scientific&apos;s laboratory equipment using natural language. Our AI searches across vectors, graphs, and metadata simultaneously.</p>

          <form className="search-wrapper" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              id="main-search"
              className="search-input"
              type="text"
              placeholder="e.g. condensers for solvent recovery with thermal shock resistance..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? '...' : 'Search'}
            </button>
          </form>

          {/* Suggestion chips */}
          {!searched && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="btn btn-ghost"
                  style={{ borderRadius: '999px', fontSize: '.8rem' }}
                  onClick={() => { setQuery(s); handleSearch(); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">
              {searched ? '🎯 Search Results' : '📦 All Products'}
            </div>
            <div className="section-count">{displayDocs.length} items</div>
          </div>

          {loading ? (
            <div className="loading-dots"><span /><span /><span /></div>
          ) : displayDocs.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🔬</span>
              <strong>{searched ? 'No results found' : 'Loading products...'}</strong>
              <p>{searched ? 'Try a different search term.' : 'Please wait while the Knowledge Fabric loads.'}</p>
            </div>
          ) : (
            <div className="cards-grid">
              {displayDocs.map(doc => <ProductCard key={doc.doc_id} doc={doc} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
