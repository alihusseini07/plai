import React, { useState } from 'react';
import InstrumentSelector from './components/InstrumentSelector.jsx';
import Stage from './components/Stage.jsx';
import SessionPanel from './components/SessionPanel.jsx';
import { initAudio } from './engine/audioEngine.js';

export default function App() {
  const [instrument, setInstrument] = useState('piano');
  const [started, setStarted] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  async function handleStart() {
    setAudioLoading(true);
    try {
      await initAudio();
      setStarted(true);
    } catch (e) {
      console.error('Audio init failed', e);
      alert('Could not load piano sounds. Check your network and try again.');
    } finally {
      setAudioLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: '24px 0 8px', fontWeight: 600 }}>plai</h1>
      {!started ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 48 }}>
          <InstrumentSelector instrument={instrument} onChange={setInstrument} />
          <button
            type="button"
            onClick={handleStart}
            disabled={audioLoading}
            style={{
              padding: '12px 32px',
              fontSize: 18,
              cursor: audioLoading ? 'wait' : 'pointer',
              borderRadius: 8,
              border: 'none',
              background: '#6c63ff',
              color: '#fff',
              opacity: audioLoading ? 0.85 : 1,
            }}
          >
            {audioLoading ? 'Loading piano…' : 'Start Session'}
          </button>
        </div>
      ) : (
        <>
          <Stage instrument={instrument} />
          <SessionPanel instrument={instrument} />
        </>
      )}
    </div>
  );
}
