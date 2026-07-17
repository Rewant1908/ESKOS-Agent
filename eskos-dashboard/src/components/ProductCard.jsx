import { useNavigate } from 'react-router-dom';
import TrustScoreBadge from './TrustScoreBadge';

export default function ProductCard({ doc }) {
  const navigate = useNavigate();
  const { doc_id, document_name, document_type, product_category, material, applications = [], trust_score = 50, entity_tags = [] } = doc;

  return (
    <div className="product-card" onClick={() => navigate(`/graph?entity=product:${doc_id.replace(/-/g,'_')}`)}>
      <div className="card-header">
        <div>
          <div className="card-type">{product_category || document_type || 'Document'}</div>
        </div>
        <TrustScoreBadge score={trust_score} />
      </div>

      <div className="card-title">{document_name || doc_id}</div>
      {material && (
        <div className="card-material">{material}</div>
      )}

      {applications.length > 0 && (
        <div className="card-applications">
          {applications.slice(0, 4).map(app => (
            <span key={app} className="app-badge">{app}</span>
          ))}
          {applications.length > 4 && (
            <span className="app-badge">+{applications.length - 4} more</span>
          )}
        </div>
      )}

      <div className="card-footer">
        <div className="card-actions">
          <button
            className="btn btn-teal"
            onClick={e => { e.stopPropagation(); navigate(`/graph?entity=doc:${doc_id}`); }}
          >
            🕸️ Graph
          </button>
          <button
            className="btn btn-primary"
            onClick={e => { e.stopPropagation(); navigate(`/chat?q=${encodeURIComponent('Tell me about ' + document_name)}`); }}
          >
            🤖 Ask AI
          </button>
        </div>
        <span className="tag">v{doc.version || '1.0'}</span>
      </div>
    </div>
  );
}
