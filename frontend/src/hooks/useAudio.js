import { useRef, useCallback } from 'react';
import { playNote, playDrumHit, midiToFreq } from '../engine/audioEngine.js';

export default function useAudio() {
  const noteEventsRef = useRef([]);

  const triggerNote = useCallback((midi, fingerSlot = 0, noteName = '') => {
    const triggered = playNote(midiToFreq(midi), 0.6, fingerSlot, 'triangle');
    if (triggered) {
      noteEventsRef.current.push({
        type: 'note',
        midi,
        note: noteName,
        timestamp: Date.now(),
        fingerSlot,
      });
    }
    return triggered;
  }, []);

  const triggerDrum = useCallback((drumType = 'kick', fingerSlot = 0) => {
    const triggered = playDrumHit(fingerSlot);
    if (triggered) {
      noteEventsRef.current.push({
        type: 'drum',
        drum: drumType,
        timestamp: Date.now(),
        fingerSlot,
      });
    }
    return triggered;
  }, []);

  const flushEvents = useCallback(() => {
    const events = [...noteEventsRef.current];
    noteEventsRef.current = [];
    return events;
  }, []);

  return { triggerNote, triggerDrum, flushEvents };
}
