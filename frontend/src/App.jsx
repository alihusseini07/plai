import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthScreen from './screens/AuthScreen.jsx';
import Dashboard from './screens/Dashboard.jsx';
import AppHeader from './components/AppHeader.jsx';
import InstrumentSelector from './components/InstrumentSelector.jsx';
import Stage from './components/Stage.jsx';
import SessionPanel from './components/SessionPanel.jsx';
import { initAudio } from './engine/audioEngine.js';

function RequireAuth({ children }) {
  const token = localStorage.getItem('plai_token');
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function PlayScreen() {
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
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white">
      <AppHeader backTo="/dashboard" />

      {!started ? (
        <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Pick an instrument
            </h1>
            <p className="text-sm text-neutral-400 max-w-sm">
              Camera access starts when you launch the session.
            </p>
          </div>

          <InstrumentSelector instrument={instrument} onChange={setInstrument} />

          <button
            type="button"
            onClick={handleStart}
            disabled={audioLoading}
            aria-busy={audioLoading}
            className="h-11 px-8 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed"
          >
            {audioLoading ? 'Loading audio…' : 'Start session'}
          </button>
        </main>
      ) : (
        <main className="flex-1 flex flex-col items-center px-4 py-6 gap-6">
          <Stage instrument={instrument} />
          <SessionPanel instrument={instrument} />
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthScreen />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/play/:instrument"
        element={
          <RequireAuth>
            <PlayScreen />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
