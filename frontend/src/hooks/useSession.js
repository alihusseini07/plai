import { useState, useRef, useCallback } from 'react';

export default function useSession() {
  const [sessionId, setSessionId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSession, setSavedSession] = useState(null);
  const startTimeRef = useRef(null);

  const startSession = useCallback(() => {
    startTimeRef.current = Date.now();
    setSessionId(null);
    setSavedSession(null);
  }, []);

  const saveSession = useCallback(async ({ instrument, noteEvents, token }) => {
    if (!startTimeRef.current) return;
    setSaving(true);

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instrument, note_events: noteEvents, duration_seconds: duration }),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const data = await res.json();
      setSessionId(data.id);
      setSavedSession(data);
      return data;
    } finally {
      setSaving(false);
    }
  }, []);

  return { sessionId, saving, savedSession, startSession, saveSession };
}
