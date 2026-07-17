'use client';
import { useState } from 'react';

export default function DraftRow({ draft, onReview }) {
  const [loading, setLoading] = useState(false);
  const isPending = draft.status === 'PENDING';

  const handleReview = async (decision) => {
    setLoading(true);
    await onReview(draft.draft_id, decision);
    setLoading(false);
  };

  return (
    <tr className="draft-row">
      <td>
        <div style={{ fontWeight: 600, marginBottom: '.2rem' }}>{draft.draft_id}</div>
        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{draft.author_agent}</div>
      </td>
      <td>
        <div className="draft-content-preview">{draft.content}</div>
      </td>
      <td>
        <span className="status-badge" style={{ whiteSpace: 'nowrap' }}>
          <span className={`status-badge status-${draft.status}`}>{draft.status}</span>
        </span>
      </td>
      <td style={{ fontSize: '.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {new Date(draft.created_at).toLocaleDateString()}
      </td>
      <td>
        {isPending && (
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button
              className="btn btn-teal"
              onClick={() => handleReview('APPROVED')}
              disabled={loading}
            >
              ✓ Approve
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleReview('REJECTED')}
              disabled={loading}
            >
              ✕ Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
