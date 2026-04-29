import { useRef, useCallback } from 'react';
import { playPianoMidi, playPianoMidiUi, playDrumHit } from '../engine/audioEngine.js';

export default function useAudio() {
  const noteEventsRef = useRef([]);

  const triggerNote = useCallback(async (midi, fingerSlot = 0, noteName = '') => {
    const triggered = await playPianoMidi(midi, fingerSlot, 0.95);
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

  /** Mouse / react-piano clicks */
  const playUiPianoKey = useCallback(async (midiNumber) => {
    const ok = await playPianoMidiUi(midiNumber, 0.55);
    if (ok) {
      noteEventsRef.current.push({
        type: 'note',
        midi: midiNumber,
        note: '',
        timestamp: Date.now(),
        fingerSlot: -1,
      });
    }
  }, []);

  const stopUiPianoKey = useCallback(() => {}, []);

  return { triggerNote, triggerDrum, flushEvents, playUiPianoKey, stopUiPianoKey };
}
