import React, { useRef, useEffect, useCallback } from 'react';
import useMediaPipe from '../hooks/useMediaPipe.js';
import useAudio from '../hooks/useAudio.js';
import CanvasOverlay from './CanvasOverlay.jsx';
import { processPianoFrame, getPianoZones } from '../instruments/piano.js';
import { processDrumFrame, getDrumZones } from '../instruments/drums.js';

const WIDTH = 640;
const HEIGHT = 480;

export default function Stage({ instrument }) {
  const videoRef = useRef(null);
  const { landmarks, handedness, confidence } = useMediaPipe(videoRef);
  const { triggerNote, triggerDrum } = useAudio();

  const processFrame = useCallback((multiHandLandmarks, canvasWidth, canvasHeight) => {
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) return { fingertips: [], zones: [] };

    if (instrument === 'piano') {
      const fingertips = processPianoFrame(multiHandLandmarks, canvasWidth, canvasHeight, triggerNote);
      const zones = getPianoZones(canvasWidth, canvasHeight);
      return { fingertips, zones };
    } else {
      const fingertips = processDrumFrame(multiHandLandmarks, canvasWidth, canvasHeight, triggerDrum);
      const zones = getDrumZones(canvasWidth, canvasHeight);
      return { fingertips, zones };
    }
  }, [instrument, triggerNote, triggerDrum]);

  return (
    <div style={{ position: 'relative', width: WIDTH, height: HEIGHT, margin: '16px auto' }}>
      <video
        ref={videoRef}
        style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, objectFit: 'cover', transform: 'scaleX(-1)' }}
        playsInline
        muted
      />
      <CanvasOverlay
        width={WIDTH}
        height={HEIGHT}
        landmarks={landmarks}
        instrument={instrument}
        processFrame={processFrame}
      />
      <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 12, color: '#aaa' }}>
        confidence: {(confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}
