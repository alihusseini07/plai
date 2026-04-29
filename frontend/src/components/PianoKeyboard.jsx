import React, { useState, useEffect } from 'react';
import { Piano } from 'react-piano';
import { PIANO_NOTE_RANGE } from '../engine/zoneDetection.js';
import 'react-piano/dist/styles.css';

/** Target pixel width for keys — scales down only if viewport is narrower. */
function computeKeyboardWidth() {
  if (typeof window === 'undefined') return 1320;
  return Math.min(1320, Math.max(760, window.innerWidth - 48));
}

/**
 * Full-range piano skin from react-piano. Highlights keys listed in activeNotes (from hands + mouse).
 */
export default function PianoKeyboard({
  activeNotes = [],
  playNote,
  stopNote,
}) {
  const [keyboardWidth, setKeyboardWidth] = useState(computeKeyboardWidth);

  useEffect(() => {
    function onResize() {
      setKeyboardWidth(computeKeyboardWidth());
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '8px 0 24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          overflowX: 'auto',
          maxWidth: 'min(1320px, calc(100vw - 24px))',
          marginLeft: 'auto',
          marginRight: 'auto',
          borderRadius: 12,
          background: '#fafafa',
          padding: '16px 20px 20px',
          boxShadow: '0 6px 32px rgba(0,0,0,0.06)',
          border: '1px solid #eaeaea',
        }}
      >
        <Piano
          noteRange={{ first: PIANO_NOTE_RANGE.first, last: PIANO_NOTE_RANGE.last }}
          playNote={playNote}
          stopNote={stopNote}
          width={keyboardWidth}
          activeNotes={activeNotes}
        />
      </div>
    </div>
  );
}
