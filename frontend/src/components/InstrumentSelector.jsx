import React from 'react';

const INSTRUMENTS = [
  { id: 'piano', label: 'Piano', description: 'Fingertip y-position triggers notes' },
  { id: 'drums', label: 'Drums', description: 'Fast downward swipe triggers hits' },
];

export default function InstrumentSelector({ instrument, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose instrument"
      className="grid grid-cols-2 gap-3 w-full max-w-md"
    >
      {INSTRUMENTS.map((ins) => {
        const selected = instrument === ins.id;
        return (
          <button
            key={ins.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(ins.id)}
            className={
              'flex flex-col gap-1 p-4 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ' +
              (selected
                ? 'border-blue-500 bg-neutral-900 text-white'
                : 'border-neutral-800 bg-neutral-900 text-white hover:border-neutral-600')
            }
          >
            <span className="text-sm font-semibold">{ins.label}</span>
            <span className="text-xs text-neutral-400">{ins.description}</span>
          </button>
        );
      })}
    </div>
  );
}
