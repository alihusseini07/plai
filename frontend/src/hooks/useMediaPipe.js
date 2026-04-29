import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

const CONFIDENCE_THRESHOLD = 0.6;
const HOLD_DURATION_MS = 200;

export default function useMediaPipe(videoRef) {
  const [landmarks, setLandmarks] = useState([]);
  const [handedness, setHandedness] = useState([]);
  const [confidence, setConfidence] = useState(0);

  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const lastGoodLandmarks = useRef([]);
  const lastGoodHandedness = useRef([]);
  const lastGoodTime = useRef(0);

  const onResults = useCallback((results) => {
    const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;

    if (hasHands) {
      const score = results.multiHandWorldLandmarks
        ? results.multiHandWorldLandmarks.length / (results.multiHandLandmarks.length || 1)
        : 1;

      const detectedConfidence = results.multiHandedness?.[0]?.score ?? 1;

      if (detectedConfidence >= CONFIDENCE_THRESHOLD) {
        lastGoodLandmarks.current = results.multiHandLandmarks;
        lastGoodHandedness.current = results.multiHandedness ?? [];
        lastGoodTime.current = performance.now();
        setLandmarks(results.multiHandLandmarks);
        setHandedness(results.multiHandedness ?? []);
        setConfidence(detectedConfidence);
      } else {
        // Below threshold — hold last position for up to HOLD_DURATION_MS.
        const age = performance.now() - lastGoodTime.current;
        if (age <= HOLD_DURATION_MS) {
          setLandmarks(lastGoodLandmarks.current);
          setHandedness(lastGoodHandedness.current);
        } else {
          setLandmarks([]);
          setHandedness([]);
        }
        setConfidence(detectedConfidence);
      }
    } else {
      const age = performance.now() - lastGoodTime.current;
      if (age <= HOLD_DURATION_MS && lastGoodLandmarks.current.length > 0) {
        setLandmarks(lastGoodLandmarks.current);
        setHandedness(lastGoodHandedness.current);
      } else {
        setLandmarks([]);
        setHandedness([]);
      }
      setConfidence(0);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    cameraRef.current = camera;

    return () => {
      camera.stop();
      hands.close();
    };
  }, [videoRef, onResults]);

  return { landmarks, handedness, confidence };
}
