import Soundfont from 'soundfont-player';

let audioCtx = null;
/** @type {{ play: (note: string|number, when?: number, opts?: object) => unknown } | null} */
let pianoInstrument = null;

// Must be called inside a user gesture handler (click/tap) to satisfy browser autoplay policy.
export async function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
  }
  if (!pianoInstrument) {
    // GM acoustic grand — loads mp3 samples from gleitz MIDI.js CDN (MusyngKite).
    // Do NOT pass `notes` / `only` with MIDI numbers: MIDI.js fonts use string keys ("C4"),
    // so numeric filters load zero buffers and playback is silent.
    pianoInstrument = await Soundfont.instrument(audioCtx, 'acoustic_grand_piano', {
      format: 'mp3',
      soundfont: 'MusyngKite',
    });
  }
  return audioCtx;
}

export function getAudioContext() {
  return audioCtx;
}

export function isPianoLoaded() {
  return !!pianoInstrument;
}

async function ensureAudioRunning() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
}

// Slots 0–9: fingertips; 15: mouse / react-piano UI (see useAudio).
const lastTriggerTime = new Array(16).fill(0);
const COOLDOWN_MS = 200;

/**
 * Play a piano note from sampled SoundFont (realistic timbre).
 * @param {number} midi - MIDI note 0–127
 * @param {number} fingerSlot - 0–15
 * @param {number} durationSec - note length in seconds
 * @returns {boolean}
 */
export async function playPianoMidi(midi, fingerSlot = 0, durationSec = 0.95) {
  if (!audioCtx || !pianoInstrument) return false;

  await ensureAudioRunning();

  const slot = Math.min(15, Math.max(0, fingerSlot));
  const now = performance.now();
  if (now - lastTriggerTime[slot] < COOLDOWN_MS) return false;
  lastTriggerTime[slot] = now;

  const m = Math.max(0, Math.min(127, Math.round(midi)));
  pianoInstrument.play(m, audioCtx.currentTime, { duration: durationSec });
  return true;
}

const UI_COOLDOWN_MS = 80;

/** Mouse clicks on react-piano — slightly shorter envelope. */
export async function playPianoMidiUi(midi, durationSec = 0.55) {
  if (!audioCtx || !pianoInstrument) return false;

  await ensureAudioRunning();

  const slot = 15;
  const now = performance.now();
  if (now - lastTriggerTime[slot] < UI_COOLDOWN_MS) return false;
  lastTriggerTime[slot] = now;

  const m = Math.max(0, Math.min(127, Math.round(midi)));
  pianoInstrument.play(m, audioCtx.currentTime, { duration: durationSec });
  return true;
}

/**
 * Legacy synth fallback (not used for piano once SoundFont loads).
 * @param {number} frequency - Hz
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

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.6, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.3, t + duration * 0.3);
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

  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

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
