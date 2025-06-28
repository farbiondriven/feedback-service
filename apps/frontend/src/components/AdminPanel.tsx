// apps/frontend/src/components/AdminPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchFeedbacks, FeedbackRecord } from '../api';

const CACHE_KEY = 'feedback_records';
const CACHE_TIME_KEY = 'feedback_cache_time';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_LEN = 200;

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};
const modalStyles: React.CSSProperties = {
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-color)',
  padding: '1rem',
  borderRadius: '4px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  minWidth: '300px',
};

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '1rem',
  fontFamily: 'inherit',
};
const thStyles: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '2px solid var(--text-color)',
  padding: '0.5rem',
  backgroundColor: 'var(--table-header-bg)',
};
const tdStyles: React.CSSProperties = {
  padding: '0.5rem',
  borderBottom: '1px solid var(--text-color)',
};
const containerStyles: React.CSSProperties = {
  overflowX: 'auto',
};

export default function AdminPanel() {
  const [token, setToken] = useState<string>('');
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpanded] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [draftToken, setDraftToken] = useState('');

  // load token on mount
  useEffect(() => {
    const saved = localStorage.getItem('adminToken');
    if (saved) {
      setToken(saved);
    }
  }, []);

  // persist token
  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      // clear cache when token changes
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      loadFeedbacks();
    }
  }, [token]);

  // fetch & cache
  const loadFeedbacks = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const data = await fetchFeedbacks(token);
      setRecords(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (err: any) {
      if (err.message.includes('401')) {
        setError('Invalid admin token');
        setShowAuthModal(true);
        setToken('');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // on mount, load from cache or fetch
  useEffect(() => {
    if (!token) return;
    const ts = parseInt(localStorage.getItem(CACHE_TIME_KEY) || '0', 10);
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw && Date.now() - ts < CACHE_TTL_MS) {
      setRecords(JSON.parse(raw));
    } else {
      loadFeedbacks();
    }
  }, [token, loadFeedbacks]);

  // toggle expand/collapse
  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // open the modal
  const handleAuthorize = () => {
    setDraftToken(token);
    setShowAuthModal(true);
    setError(null);
  };

  // save token from modal
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftToken.trim()) {
      setShowAuthModal(false);
      setToken(draftToken.trim());
    }
  };

  return (
    <div>
      <h2
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Admin Panel
        <button onClick={handleAuthorize} style={{ fontSize: '1.2em' }}>
          🔒 Authorize
        </button>
      </h2>

      {loading && <p>Loading feedback…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {records.length > 0 && (
        <div style={containerStyles}>
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={thStyles}>ID</th>
                <th style={thStyles}>Content</th>
                <th style={thStyles}>Sentiment</th>
                <th style={thStyles}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const expanded = expandedIds.has(r.id);
                return (
                  <tr
                    key={r.id}
                    style={{
                      backgroundColor:
                        idx % 2 === 0
                          ? 'var(--stripe-even)'
                          : 'var(--stripe-odd)',
                    }}
                  >
                    <td style={tdStyles}>{r.id}</td>
                    <td
                      onClick={() => toggleExpand(r.id)}
                      title={expanded ? '' : r.content}
                      style={{
                        ...tdStyles,
                        cursor: 'pointer',
                        maxWidth: '400px',
                        whiteSpace: expanded ? 'normal' : 'nowrap',
                        overflow: expanded ? 'visible' : 'hidden',
                        textOverflow: expanded ? 'clip' : 'ellipsis',
                        wordBreak: expanded ? 'break-word' : undefined,
                      }}
                    >
                      {expanded
                        ? r.content
                        : r.content.length > MAX_LEN
                          ? `${r.content.slice(0, MAX_LEN)}…`
                          : r.content}
                    </td>
                    <td style={tdStyles}>{r.sentiment}</td>
                    <td style={tdStyles}>
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAuthModal && (
        <div style={overlayStyles}>
          <div style={modalStyles}>
            <h3>Enter Admin Token</h3>
            <form onSubmit={handleSaveToken}>
              <input
                type='password'
                value={draftToken}
                onChange={(e) => setDraftToken(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                }}
                autoFocus
                required
              />
              <div style={{ textAlign: 'right' }}>
                <button
                  type='button'
                  onClick={() => setShowAuthModal(false)}
                  style={{ marginRight: '0.5rem' }}
                >
                  Cancel
                </button>
                <button type='submit'>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
