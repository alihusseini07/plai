import { toCanvasCoords, buildDrumZones, isDownwardSpike } from '../engine/zoneDetection.js';
import { LandmarkSmoother } from '../engine/gestureSmoothing.js';

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];
const WRIST_INDEX = 0;

const smoothers = [new LandmarkSmoother(), new LandmarkSmoother()];

// Track previous wrist y-position per hand for velocity calculation.
const prevWristY = [null, null];
const prevFrameTime = [0, 0];

function fingerSlot(tipIndex, handIndex) {
  const local = FINGERTIP_INDICES.indexOf(tipIndex);
  return handIndex * 5 + local;
}

/**
 * Process a MediaPipe results frame for drums mode.
 * Triggers drum hits on fast downward wrist velocity within a drum zone.
 *
 * @param {object[]} multiHandLandmarks
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {function} triggerDrum - (drumType, fingerSlot) => void
 * @returns {Array<{ x, y }>} fingertip canvas positions
 */
export function processDrumFrame(multiHandLandmarks, canvasWidth, canvasHeight, triggerDrum) {
  const zones = buildDrumZones(canvasWidth, canvasHeight);
  const fingertipPositions = [];
  const now = performance.now();

  multiHandLandmarks.forEach((landmarks, handIdx) => {
    const smoothed = smoothers[handIdx].smooth(landmarks);

    // Use wrist for velocity-based drum triggering.
    const wristCoord = toCanvasCoords(smoothed[WRIST_INDEX], canvasWidth, canvasHeight);
    const deltaMs = now - (prevFrameTime[handIdx] || now);

    if (prevWristY[handIdx] !== null && deltaMs > 0) {
      const spike = isDownwardSpike(prevWristY[handIdx], wristCoord.y, deltaMs);

      if (spike) {
        // Find which drum zone the wrist is over.
        const zone = zones.find(z =>
          wristCoord.x >= z.x && wristCoord.x <= z.x + z.width
        );
        if (zone) {
          const slot = handIdx * 5;
          triggerDrum(zone.drum, slot);
        }
      }
    }

    prevWristY[handIdx] = wristCoord.y;
    prevFrameTime[handIdx] = now;

    // Collect fingertip positions for overlay.
    FINGERTIP_INDICES.forEach((tipIdx) => {
      const coord = toCanvasCoords(smoothed[tipIdx], canvasWidth, canvasHeight);
      fingertipPositions.push(coord);
    });
  });

  return fingertipPositions;
}

export function getDrumZones(canvasWidth, canvasHeight) {
  return buildDrumZones(canvasWidth, canvasHeight);
}
