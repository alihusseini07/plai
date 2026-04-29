let audioCtx = null;

// Must be called inside a user gesture handler (click/tap) to satisfy browser autoplay policy.
export async function initAudio() {
  if (audioCtx) return audioCtx;
  audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  return audioCtx;
}

export function getAudioContext() {
  return audioCtx;
}

// Per-finger cooldown: 10 slots (0-9), one per MediaPipe fingertip index.
// MediaPipe finger tip indices: 4, 8, 12, 16, 20 (right hand) + same for left.
// We map them to slots 0-9 by: slot = fingerIndex < 5 ? fingerIndex : fingerIndex - 5 + 5.
// Callers pass a slotIndex 0-9 directly.
// Slots 0–9: fingertips; 15: mouse / react-piano UI (see useAudio).
const lastTriggerTime = new Array(16).fill(0);
const COOLDOWN_MS = 200;

/**
 * Play a note using OscillatorNode + GainNode.
 * @param {number} frequency - Hz
 * @param {number} duration - seconds
 * @param {number} fingerSlot - 0-9, used for per-finger cooldown
 * @param {'sine'|'triangle'|'square'|'sawtooth'} type - oscillator waveform
 * @returns {boolean} true if note was triggered, false if on cooldown
 */
export function playNote(frequency, duration = 0.5, fingerSlot = 0, type = 'sine') {
  if (!audioCtx) return false;

  const slot = Math.min(15, Math.max(0, fingerSlot));
  const now = performance.now();
  if (now - lastTriggerTime[slot] < COOLDOWN_MS) return false;
  lastTriggerTime[slot] = now;

  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);

  // Attack: ramp up quickly to avoid click.
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.6, t + 0.01);

  // Decay + sustain: natural exponential fall-off.
  gain.gain.exponentialRampToValueAtTime(0.3, t + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(t);
  osc.stop(t + duration);

  return true;
}

/** Cooldown bypass for mouse-driven react-piano (short staccato clicks). */
const UI_COOLDOWN_MS = 80;

export function playNoteUi(frequency, duration = 0.35, type = 'triangle') {
  if (!audioCtx) return false;
  const slot = 15;
  const now = performance.now();
  if (now - lastTriggerTime[slot] < UI_COOLDOWN_MS) return false;
  lastTriggerTime[slot] = now;

  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.45, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration);
  return true;
}

/**
 * Play a drum hit: short, punchy noise burst.
 * @param {number} fingerSlot - 0-9
 */
export function playDrumHit(fingerSlot = 0) {
  if (!audioCtx) return false;

  const now = performance.now();
  if (now - lastTriggerTime[fingerSlot] < COOLDOWN_MS) return false;
  lastTriggerTime[fingerSlot] = now;

  const t = audioCtx.currentTime;
  const duration = 0.15;

  // White-noise buffer for snare body.
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  // Low-pass to shape the noise into a drum body.
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  // Sub kick: sine tone at 60Hz for body.
  const kick = audioCtx.createOscillator();
  kick.frequency.setValueAtTime(150, t);
  kick.frequency.exponentialRampToValueAtTime(60, t + 0.1);
  const kickGain = audioCtx.createGain();
  kickGain.gain.setValueAtTime(0.9, t);
  kickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  kick.connect(kickGain);
  kickGain.connect(audioCtx.destination);

  noise.start(t);
  noise.stop(t + duration);
  kick.start(t);
  kick.stop(t + 0.15);

  return true;
}

/**
 * Convert a MIDI note number to frequency (Hz).
 * Middle C (C4) = 60.
 */
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
