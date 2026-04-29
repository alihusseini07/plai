import React, { useState, useEffect } from 'react';
import useSession from '../hooks/useSession.js';
import useAudio from '../hooks/useAudio.js';

export default function SessionPanel({ instrument }) {
  const { saving, savedSession, startSession, saveSession } = useSession();
  const { flushEvents } = useAudio();
  const [backingTrack, setBackingTrack] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [token] = useState(() => localStorage.getItem('plai_token'));

  useEffect(() => {
    startSession();
  }, [startSession]);

  async function handleSave() {
    const noteEvents = flushEvents();
    const session = await saveSession({ instrument, noteEvents, token });
    if (!session) return;

    // Request AI backing track description via streaming.
    setStreaming(true);
    setBackingTrack('');

    const res = await fetch(`/api/ai/backing-track/${session.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok || !res.body) {
      setStreaming(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setBackingTrack(prev => prev + chunk);
    }
    setStreaming(false);
  }

  return (
    <div style={{ width: 640, margin: '16px auto', padding: 16, background: '#111', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#aaa', fontSize: 14 }}>Session</span>
        <button
          onClick={handleSave}
          disabled={saving || streaming || !token}
          style={{ padding: '8px 20px', borderRadius: 6, background: '#6c63ff', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save & Generate Backing Track'}
        </button>
      </div>

      {!token && (
        <p style={{ color: '#f87', fontSize: 13, marginTop: 8 }}>Log in to save sessions.</p>
      )}

      {(backingTrack || streaming) && (
        <div style={{ marginTop: 16, padding: 12, background: '#1a1a2e', borderRadius: 6, fontSize: 14, lineHeight: 1.6, color: '#ccc' }}>
          <strong style={{ color: '#6c63ff' }}>AI Backing Track:</strong>
          <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
            {backingTrack}
            {streaming && <span style={{ animation: 'pulse 1s infinite' }}>▌</span>}
          </p>
        </div>
      )}
    </div>
  );
}
