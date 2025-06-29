import React, { useState } from 'react';
import { submitFeedback } from '../api';

const MAX_LEN = 1000;

export default function FeedbackForm() {
  const [content, setContent] = useState('');
  const [id, setId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setId(null);
    try {
      const { id } = await submitFeedback(content.trim());
      setId(id);
      setContent('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Submit Feedback</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        cols={50}
        maxLength={MAX_LEN}
        required
      />
      <div
        style={{
          fontSize: '0.9em',
          color: content.length > MAX_LEN ? 'red' : undefined,
        }}
      >
        {content.length} / {MAX_LEN}
      </div>
      <br />
      <button type='submit' disabled={content.trim().length === 0}>
        Send
      </button>
      {id && (
        <p style={{ color: 'green' }}>Thanks! Your feedback ID is {id}.</p>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </form>
  );
}
