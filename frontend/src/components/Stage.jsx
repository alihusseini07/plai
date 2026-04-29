import React, { useRef, useEffect, useState, useCallback } from 'react';
import useMediaPipe from '../hooks/useMediaPipe.js';
import useAudio from '../hooks/useAudio.js';
import CanvasOverlay from './CanvasOverlay.jsx';
import PianoKeyboard from './PianoKeyboard.jsx';
import { processPianoFrame } from '../instruments/piano.js';
import { processDrumFrame, getDrumZones } from '../instruments/drums.js';

/** Video / gesture canvas — compact strip above the piano */
const WIDTH = 400;
const HEIGHT = 300;

export default function Stage({ instrument }) {
  const videoRef = useRef(null);
  const { landmarks, confidence } = useMediaPipe(videoRef);
  const { triggerNote, triggerDrum, playUiPianoKey, stopUiPianoKey } = useAudio();

  const [zones, setZones] = useState([]);
  const [activePianoMidis, setActivePianoMidis] = useState([]);

  const runInstrumentFrame = useCallback(() => {
    if (!landmarks?.length) {
      setZones([]);
      setActivePianoMidis([]);
      return;
    }

    if (instrument === 'piano') {
      const { activeMidis } = processPianoFrame(landmarks, WIDTH, HEIGHT, triggerNote);
      setActivePianoMidis(activeMidis);
      setZones([]);
    } else {
      processDrumFrame(landmarks, WIDTH, HEIGHT, triggerDrum);
      setZones(getDrumZones(WIDTH, HEIGHT));
      setActivePianoMidis([]);
    }
  }, [landmarks, instrument, triggerNote, triggerDrum]);

  useEffect(() => {
    runInstrumentFrame();
  }, [runInstrumentFrame]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
      <div style={{ position: 'relative', width: WIDTH, height: HEIGHT, margin: '12px auto 0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
          playsInline
          muted
        />
        <CanvasOverlay
          width={WIDTH}
          height={HEIGHT}
          landmarks={landmarks}
          instrument={instrument}
          zones={zones}
        />
        <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 11, color: '#eee', background: 'rgba(0,0,0,0.45)', padding: '4px 8px', borderRadius: 6 }}>
          {(confidence * 100).toFixed(0)}%
        </div>
      </div>

      {instrument === 'piano' && (
        <PianoKeyboard
          activeNotes={activePianoMidis}
          playNote={playUiPianoKey}
          stopNote={stopUiPianoKey}
        />
      )}
    </div>
  );
}
