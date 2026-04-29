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
            border: `2px solid ${instrument === ins.id ? '#6c63ff' : '#d0d0d0'}`,
            background: instrument === ins.id ? '#f3f1ff' : '#ffffff',
            color: '#1a1a1a',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18 }}>{ins.label}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{ins.description}</div>
        </button>
      ))}
    </div>
  );
}
