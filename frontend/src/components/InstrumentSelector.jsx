import React from 'react';

const INSTRUMENTS = [
  { id: 'piano', label: 'Piano', description: 'Fingertip y-position triggers notes' },
  { id: 'drums', label: 'Drums', description: 'Fast downward swipe triggers hits' },
];

export default function InstrumentSelector({ instrument, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {INSTRUMENTS.map(ins => (
        <button
          key={ins.id}
          onClick={() => onChange(ins.id)}
          style={{
            padding: '16px 24px',
            borderRadius: 8,
            border: `2px solid ${instrument === ins.id ? '#6c63ff' : '#333'}`,
            background: instrument === ins.id ? '#1a1a2e' : 'transparent',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18 }}>{ins.label}</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{ins.description}</div>
        </button>
      ))}
    </div>
  );
}
