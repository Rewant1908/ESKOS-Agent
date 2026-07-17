import { useState, useEffect, useCallback } from 'react';
import DraftRow from '../components/DraftRow';

const GOV_URL = import.meta.env.VITE_GOV_URL;

export default function Governance() {
  const [tab, setTab] = useState('PENDING');
  const [drafts, setDrafts] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GOV_URL}/api/v1/governance/drafts?status=${tab}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      setDrafts(Array.isArray(data) ? data : []);
    } catch { setDrafts([]); }
    setLoading(false);
  }, [tab]);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch(`${GOV_URL}/api/v1/governance/audit`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await res.json();
      setAudit(Array.isArray(data) ? data : []);
    } catch { setAudit([]); }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);
  useEffect(() => { if (tab === 'AUDIT') fetchAudit(); }, [tab, fetchAudit]);

  const handleReview = async (draftId, decision) => {
    try {
      const res = await fetch(`${GOV_URL}/api/v1/governance/drafts/${draftId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ reviewer_id: 'dashboard-user', decision, comments: `${decision} via ESKOS Dashboard` }),
      });
      const data = await res.json();
      setNotification({ type: decision === 'APPROVED' ? 'success' : 'error', msg: `${decision}: ${draftId}`, hash: data.audit_receipt });
      setTimeout(() => setNotification(null), 5000);
      fetchDrafts();
    } catch {
      setNotification({ type: 'error', msg: 'Review failed — is the governance service running?' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="page">
      <div className="container governance-page">
        <div className="hero" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem', textAlign: 'left' }}>
          <div className="hero-tag">📋 Human-in-the-Loop</div>
          <h1 style={{ fontSize: '2rem' }}>Content Governance</h1>
          <p>Review AI-generated content drafts before publishing. All decisions are cryptographically hashed for audit compliance.</p>
        </div>

        {notification && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: notification.type === 'success' ? 'rgba(0,212,170,.1)' : 'rgba(255,107,107,.1)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(0,212,170,.3)' : 'rgba(255,107,107,.3)'}`,
            color: notification.type === 'success' ? 'var(--accent-teal)' : 'var(--accent-red)',
            marginBottom: '1.5rem',
          }}>
            <strong>{notification.msg}</strong>
            {notification.hash && (
              <div style={{ fontSize: '.8rem', marginTop: '.4rem', opacity: .7 }}>
                SHA-256: {notification.hash}
              </div>
            )}
          </div>
        )}

        <div className="governance-tabs">
          {['PENDING','APPROVED','REJECTED','AUDIT'].map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'PENDING' ? '⏳' : t === 'APPROVED' ? '✅' : t === 'REJECTED' ? '❌' : '📜'} {t}
            </button>
          ))}
        </div>

        {tab === 'AUDIT' ? (
          <div>
            {audit.length === 0 ? (
              <div className="empty-state">
                <span className="icon">📜</span>
                <strong>No audit entries yet</strong>
                <p>Audit entries appear when drafts are approved or rejected.</p>
              </div>
            ) : audit.map((entry, i) => (
              <div key={i} className="audit-entry">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={`status-badge status-${entry.decision}`}>{entry.decision}</span>
                    <span style={{ marginLeft: '.75rem', fontWeight: 600 }}>{entry.draft_id}</span>
                  </div>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', margin: '.4rem 0' }}>
                  Reviewer: <strong>{entry.reviewer_id}</strong>
                  {entry.comments && <span style={{ marginLeft: '1rem' }}>"{entry.comments}"</span>}
                </div>
                <div className="audit-hash">🔐 {entry.content_hash}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="loading-dots"><span /><span /><span /></div>
            ) : drafts.length === 0 ? (
              <div className="empty-state">
                <span className="icon">{tab === 'PENDING' ? '⏳' : '📭'}</span>
                <strong>No {tab.toLowerCase()} drafts</strong>
                <p>{tab === 'PENDING' ? 'No drafts are currently awaiting review.' : `No ${tab.toLowerCase()} drafts found.`}</p>
              </div>
            ) : (
              <table className="drafts-table">
                <thead>
                  <tr>
                    <th>Draft ID / Agent</th>
                    <th>Content Preview</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map(d => <DraftRow key={d.draft_id} draft={d} onReview={handleReview} />)}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
