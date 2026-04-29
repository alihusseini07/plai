import { toCanvasCoords, checkZoneHit, buildPianoZones } from '../engine/zoneDetection.js';
import { LandmarkSmoother } from '../engine/gestureSmoothing.js';

// Fingertip landmark indices in MediaPipe Hands model.
const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

// Map fingertip index (4,8,12,16,20) to finger slot (0-4) per hand.
// Left hand occupies slots 0-4, right hand 5-9.
function fingerSlot(tipIndex, handIndex) {
  const local = FINGERTIP_INDICES.indexOf(tipIndex);
  return handIndex * 5 + local;
}

const smoothers = [new LandmarkSmoother(), new LandmarkSmoother()];

/**
 * Process a MediaPipe results frame for piano mode.
 *
 * @param {object[]} multiHandLandmarks
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {function} triggerNote - (midi, fingerSlot, noteName) => void
 * @returns {{ fingertips: Array<{ x, y }>, activeMidis: number[] }}
 */
export function processPianoFrame(multiHandLandmarks, canvasWidth, canvasHeight, triggerNote) {
  const zones = buildPianoZones(canvasWidth, canvasHeight);
  const fingertipPositions = [];
  /** @type {Set<number>} */
  const active = new Set();

  multiHandLandmarks.forEach((landmarks, handIdx) => {
    const smoothed = smoothers[handIdx].smooth(landmarks);

    FINGERTIP_INDICES.forEach((tipIdx) => {
      const lm = smoothed[tipIdx];
      const coord = toCanvasCoords(lm, canvasWidth, canvasHeight);
      fingertipPositions.push(coord);

      const zone = checkZoneHit(coord, zones);
      if (zone) {
        active.add(zone.midi);
        const slot = fingerSlot(tipIdx, handIdx);
        triggerNote(zone.midi, slot, zone.note);
      }
    });
  });

  const activeMidis = [...active].sort((a, b) => a - b);
  return { fingertips: fingertipPositions, activeMidis };
}

export function getPianoZones(canvasWidth, canvasHeight) {
  return buildPianoZones(canvasWidth, canvasHeight);
}
