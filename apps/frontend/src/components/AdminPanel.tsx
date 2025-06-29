import React, { useState } from 'react';
import { fetchFeedbacks, FeedbackRecord } from '../api';

const MAX_LEN = 200;

const container: React.CSSProperties = { overflowX: 'auto' };
const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '1rem',
};
const th: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '2px solid var(--text-color)',
  padding: '0.5rem',
};
const td: React.CSSProperties = {
  padding: '0.5rem',
  borderBottom: '1px solid var(--text-color)',
};

export default function AdminPanel() {
  const [token, setToken] = useState('');
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const load = async () => {
    if (!token.trim()) {
      setError('Please enter the admin token.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeedbacks(token.trim());
      setRecords(data);
    } catch (err: any) {
      setError(
        err.message.includes('401') ? 'Invalid admin token' : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <h2>Admin Panel</h2>

      {/* --- inline password box --- */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type='password'
          value={token}
          placeholder='Admin token'
          onChange={(e) => setToken(e.target.value)}
          style={{
            padding: '0.4rem',
            marginRight: '0.5rem',
            minWidth: '250px',
          }}
        />
        <button onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Load feedback'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {records.length > 0 && (
        <div style={container}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Content</th>
                <th style={th}>Sentiment</th>
                <th style={th}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const isExp = expanded.has(r.id);
                return (
                  <tr
                    key={r.id}
                    style={{
                      backgroundColor:
                        idx % 2 ? 'var(--stripe-odd)' : 'var(--stripe-even)',
                    }}
                  >
                    <td style={td}>{r.id}</td>
                    <td
                      onClick={() => toggle(r.id)}
                      title={isExp ? '' : r.content}
                      style={{
                        ...td,
                        cursor: 'pointer',
                        maxWidth: 400,
                        whiteSpace: isExp ? 'normal' : 'nowrap',
                        overflow: isExp ? 'visible' : 'hidden',
                        textOverflow: isExp ? 'clip' : 'ellipsis',
                        wordBreak: isExp ? 'break-word' : undefined,
                      }}
                    >
                      {isExp
                        ? r.content
                        : r.content.length > MAX_LEN
                          ? `${r.content.slice(0, MAX_LEN)}…`
                          : r.content}
                    </td>
                    <td style={td}>{r.sentiment}</td>
                    <td style={td}>{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
