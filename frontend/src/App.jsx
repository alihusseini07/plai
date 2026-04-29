import React, { useState } from 'react';
import InstrumentSelector from './components/InstrumentSelector.jsx';
import Stage from './components/Stage.jsx';
import SessionPanel from './components/SessionPanel.jsx';
import { initAudio } from './engine/audioEngine.js';

export default function App() {
  const [instrument, setInstrument] = useState('piano');
  const [started, setStarted] = useState(false);

  async function handleStart() {
    await initAudio();
    setStarted(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: '24px 0 8px', fontWeight: 600 }}>plai</h1>
      {!started ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 48 }}>
          <InstrumentSelector instrument={instrument} onChange={setInstrument} />
          <button onClick={handleStart} style={{ padding: '12px 32px', fontSize: 18, cursor: 'pointer', borderRadius: 8, border: 'none', background: '#6c63ff', color: '#fff' }}>
            Start Session
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
