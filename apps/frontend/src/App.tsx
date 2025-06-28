// apps/frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import FeedbackForm from './components/FeedbackForm';
import AdminPanel from './components/AdminPanel';

enum View {
  Form = 'FORM',
  Admin = 'ADMIN',
}

export default function App() {
  const [view, setView] = useState<View>(View.Form);
  const [darkMode, setDark] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem('darkMode') || 'false'),
  );

  // When darkMode changes, toggle class on <html> and persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div style={{ maxWidth: '90vw', margin: '2rem auto', padding: '1rem' }}>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--nav-bg)',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
        }}
      >
        <button onClick={() => setView(View.Form)} disabled={view === View.Form}>
          Feedback
        </button>
        <button
          onClick={() => setView(View.Admin)}
          disabled={view === View.Admin}
          style={{ marginLeft: 'auto' }}
        >
          🔒 Admin
        </button>
        <button
          onClick={() => setDark((d) => !d)}
          style={{ marginLeft: '1rem' }}
          title="Toggle Dark Mode"
        >
          {darkMode ? '🌞 Light' : '🌙 Dark'}
        </button>
      </nav>
      {view === View.Form ? <FeedbackForm /> : <AdminPanel />}
    </div>
  );
}
