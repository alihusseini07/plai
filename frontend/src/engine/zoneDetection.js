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

// Piano keyboard layout constants.
const PIANO_KEY_COUNT = 14;
const PIANO_ZONE_HEIGHT = 80;

// C major scale MIDI notes starting at C4 (60), 14 keys = C4 to D5.
const PIANO_MIDI_NOTES = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83];

const NOTE_NAMES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5'];

/**
 * Build piano zone rectangles for the given canvas dimensions.
 * Zones span the full canvas width, distributed evenly, anchored at the bottom.
 *
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {Array<{ x, y, width, height, id, midi, note }>}
 */
export function buildPianoZones(canvasWidth, canvasHeight) {
  const keyWidth = canvasWidth / PIANO_KEY_COUNT;
  const zoneY = canvasHeight - PIANO_ZONE_HEIGHT;

  return Array.from({ length: PIANO_KEY_COUNT }, (_, i) => ({
    id: `piano_${i}`,
    x: i * keyWidth,
    y: zoneY,
    width: keyWidth,
    height: PIANO_ZONE_HEIGHT,
    midi: PIANO_MIDI_NOTES[i],
    note: NOTE_NAMES[i],
  }));
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
