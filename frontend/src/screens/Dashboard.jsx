import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('plai_token');
    navigate('/');
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white">
      <AppHeader>
        <button
          type="button"
          onClick={handleLogout}
          className="h-8 px-3 rounded-md text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          Log out
        </button>
      </AppHeader>

      <main className="flex-1 px-6 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-3xl space-y-12">
          {/* Heading */}
          <section>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Choose an instrument
            </h1>
            <p className="mt-2 text-base text-neutral-400">
              Start a session and play notes with your hands.
            </p>
          </section>

          {/* Instruments */}
          <section aria-label="Instruments">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InstrumentCard
                label="Piano"
                description="Fingertip y-position triggers chromatic notes across 14 zones."
                onClick={() => navigate('/play/piano')}
                glyph={<PianoGlyph />}
              />
              <InstrumentCard
                label="Drums"
                description="Fast downward wrist velocity triggers percussion hits."
                onClick={() => navigate('/play/drums')}
                glyph={<DrumGlyph />}
              />
            </div>
          </section>

          {/* Recent sessions */}
          <section>
            <h2 className="text-base font-semibold text-white mb-3">
              Recent sessions
            </h2>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900">
              <div className="flex flex-col items-center gap-2 py-14 px-6 text-center">
                <div
                  aria-hidden="true"
                  className="w-9 h-9 rounded-md border border-neutral-800 bg-neutral-950 flex items-center justify-center mb-2"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-neutral-500">
                    <path d="M7 4v9.5a2.5 2.5 0 11-1-2V4l8-1v8.5a2.5 2.5 0 11-1-2V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white">No sessions yet</p>
                <p className="text-sm text-neutral-400 max-w-xs">
                  Saved sessions and Claude-generated backing tracks will appear here.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function InstrumentCard({ label, description, glyph, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Start ${label} session`}
      className="group relative flex flex-col gap-6 p-6 h-48 rounded-xl border border-neutral-800 bg-neutral-900 text-left transition-colors hover:border-neutral-600 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-md border border-neutral-800 bg-neutral-950 flex items-center justify-center text-blue-400">
          {glyph}
        </div>
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" aria-hidden="true">
          <path d="M7 5h8v8M7 13l8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="mt-auto space-y-1">
        <p className="text-lg font-semibold text-white">{label}</p>
        <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

function PianoGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 4v8M10 4v8M13 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DrumGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
      <ellipse cx="10" cy="6" rx="6" ry="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6v8c0 1.1 2.7 2 6 2s6-.9 6-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 4l2-2M6 4L4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
