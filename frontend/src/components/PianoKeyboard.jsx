import React from 'react';
import { Piano } from 'react-piano';
import { PIANO_NOTE_RANGE } from '../engine/zoneDetection.js';
import 'react-piano/dist/styles.css';

/** Pixel width for the SVG keyboard (scroll horizontally on narrow viewports). */
const MIN_KEYBOARD_WIDTH = 960;

/**
 * Full-range piano skin from react-piano. Highlights keys listed in activeNotes (from hands + mouse).
 */
export default function PianoKeyboard({
  activeNotes = [],
  playNote,
  stopNote,
  keyboardWidth = MIN_KEYBOARD_WIDTH,
}) {
  return (
    <div
      style={{
        overflowX: 'auto',
        width: '100%',
        maxWidth: 'min(100vw - 32px, 1400px)',
        marginTop: 8,
        borderRadius: 8,
        background: '#161616',
        paddingBottom: 8,
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
  );
}
