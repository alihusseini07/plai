import React, { useRef, useEffect } from 'react';

// MediaPipe Hands skeleton connections (pairs of landmark indices).
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

export default function CanvasOverlay({ width, height, landmarks, instrument, processFrame }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw instrument zones.
    const { fingertips, zones } = processFrame(landmarks, width, height);

    // Draw zones.
    zones.forEach(zone => {
      ctx.fillStyle = instrument === 'piano'
        ? 'rgba(108, 99, 255, 0.2)'
        : 'rgba(255, 160, 50, 0.15)';
      ctx.strokeStyle = instrument === 'piano' ? '#6c63ff' : '#ffa032';
      ctx.lineWidth = 1;
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

      if (instrument === 'piano' && zone.note) {
        ctx.fillStyle = '#aaa';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(zone.note, zone.x + zone.width / 2, zone.y + zone.height - 6);
      }
      if (instrument === 'drums' && zone.drum) {
        ctx.fillStyle = '#ffa032';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(zone.drum.toUpperCase(), zone.x + zone.width / 2, zone.y + zone.height / 2);
      }
    });

    // Draw skeleton for each hand.
    landmarks.forEach(handLandmarks => {
      // Convert to canvas coords (mirroring already done in processFrame/instruments,
      // but here we do it directly for drawing).
      const pts = handLandmarks.map(lm => ({
        x: (1 - lm.x) * width,
        y: lm.y * height,
      }));

      // Connections.
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      HAND_CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
        ctx.stroke();
      });

      // Landmark dots.
      pts.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, FINGERTIP_INDICES.includes(i) ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = FINGERTIP_INDICES.includes(i) ? '#6c63ff' : 'rgba(255,255,255,0.7)';
        ctx.fill();
      });
    });
  }, [landmarks, instrument, processFrame, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    />
  );
}
