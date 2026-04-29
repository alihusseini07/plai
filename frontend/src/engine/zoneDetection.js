/**
 * Convert a MediaPipe normalized landmark (x/y in 0-1) to canvas pixel coordinates.
 * x-axis is mirrored so the user sees a natural mirror view (left hand on left side of screen).
 *
 * @param {{ x: number, y: number, z: number }} landmark
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{ x: number, y: number }}
 */
export function toCanvasCoords(landmark, canvasWidth, canvasHeight) {
  return {
    x: (1 - landmark.x) * canvasWidth,
    y: landmark.y * canvasHeight,
  };
}

/**
 * A zone is a pixel rectangle: { x, y, width, height, id, ... }.
 * Returns the first zone whose rect contains the coord, or null.
 *
 * @param {{ x: number, y: number }} coord - canvas pixel coords
 * @param {Array<{ x: number, y: number, width: number, height: number }>} zones
 * @returns {object|null}
 */
export function checkZoneHit(coord, zones) {
  for (const zone of zones) {
    if (
      coord.x >= zone.x &&
      coord.x <= zone.x + zone.width &&
      coord.y >= zone.y &&
      coord.y <= zone.y + zone.height
    ) {
      return zone;
    }
  }
  return null;
}

// Piano: full 88-key range A0–C8 (matches react-piano default range).
export const PIANO_NOTE_RANGE = { first: 21, last: 108 };

const PIANO_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const PIANO_ZONE_HEIGHT = 80;

/** @param {number} midi 0–127 */
function midiToLabel(midi) {
  const octave = Math.floor(midi / 12) - 1;
  return `${PIANO_LABELS[midi % 12]}${octave}`;
}

/**
 * Hit zones for camera: equal-width chromatic strips along the bottom of the video.
 * (Visual keyboard is react-piano; highlights use the same MIDI numbers.)
 *
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {Array<{ x, y, width, height, id, midi, note }>}
 */
export function buildPianoZones(canvasWidth, canvasHeight) {
  const { first, last } = PIANO_NOTE_RANGE;
  const count = last - first + 1;
  const keyWidth = canvasWidth / count;
  const zoneY = canvasHeight - PIANO_ZONE_HEIGHT;

  /** @type {Array<{ x, y, width, height, id, midi, note }>} */
  const zones = [];
  for (let m = first; m <= last; m++) {
    const i = m - first;
    zones.push({
      id: `piano_${m}`,
      x: i * keyWidth,
      y: zoneY,
      width: keyWidth,
      height: PIANO_ZONE_HEIGHT,
      midi: m,
      note: midiToLabel(m),
    });
  }
  return zones;
}

/**
 * Drum hit zones: three pads — left, center, right — in the upper half of the canvas.
 *
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {Array<{ x, y, width, height, id, drum }>}
 */
export function buildDrumZones(canvasWidth, canvasHeight) {
  const padWidth = canvasWidth / 3;
  const padHeight = canvasHeight * 0.4;
  const padY = canvasHeight * 0.1;
  const drums = ['hihat', 'snare', 'kick'];

  return Array.from({ length: 3 }, (_, i) => ({
    id: `drum_${i}`,
    x: i * padWidth,
    y: padY,
    width: padWidth,
    height: padHeight,
    drum: drums[i],
  }));
}

/**
 * Detect a downward velocity spike from consecutive y-positions (canvas pixels).
 * Returns true when velocity exceeds threshold — used for drum triggering.
 *
 * @param {number} prevY - previous frame y (canvas px)
 * @param {number} currY - current frame y (canvas px)
 * @param {number} deltaMs - time between frames in ms
 * @param {number} threshold - px/ms threshold (default 1.2)
 * @returns {boolean}
 */
export function isDownwardSpike(prevY, currY, deltaMs, threshold = 1.2) {
  if (deltaMs <= 0) return false;
  const velocity = (currY - prevY) / deltaMs;
  return velocity >= threshold;
}
