# plai

Browser-based app where hand gestures tracked via webcam play virtual instruments in real time. Two instruments: piano (fingertip y-position triggers notes) and drums (fast downward wrist velocity triggers hits). After a session, the note sequence is sent to Claude which generates a complementary backing track description via streaming. Sessions are stored in PostgreSQL.

PostgreSQL is currently hosted on Railway. The backend connects through `DATABASE_URL` from Railway rather than a local `plai_dev` database.

## How to run

```bash
# Terminal 1 — frontend
cd frontend
npm install
npm run dev        # http://localhost:5173

# Terminal 2 — backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm run dev        # http://localhost:3001
```

Apply the DB schema once:
```bash
psql $DATABASE_URL -f backend/db/schema.sql
```

If `psql` is not available locally, run the contents of `backend/db/schema.sql` in the Railway Postgres SQL editor instead.

## Railway database setup

- Create or use the Railway Postgres service for this project.
- Run `backend/db/schema.sql` against that Railway database.
- Set the backend service `DATABASE_URL` to the Railway Postgres connection string.
- Set `JWT_SECRET`, `FRONTEND_URL`, and `ANTHROPIC_API_KEY` in Railway for deployed environments.
- After schema or env var changes, redeploy the backend service if needed.

## How to verify changes

**Audio engine** (`frontend/src/engine/audioEngine.js`): confirm `initAudio()` is called only from a button click handler, `playNote()` uses OscillatorNode + GainNode with exponential ramp decay, and `lastTriggerTime` array enforces 200ms per-finger cooldown.

**Zone detection** (`frontend/src/engine/zoneDetection.js`): confirm `toCanvasCoords` mirrors x-axis (`(1 - landmark.x) * width`), `checkZoneHit` uses inclusive bounds, and `buildPianoZones` produces 14 evenly-spaced rectangles anchored at canvas bottom.

**Backend routes** (`backend/routes/`): confirm `requireAuth` middleware is applied to every handler in `sessions.js` and `ai.js`. Auth routes (`auth.js`) must NOT require the middleware.

## Key rules

- **Always use oscillators, never audio files.** All instrument sounds must come from OscillatorNode. Never use HTMLAudioElement or load MP3/WAV files.
- **Never create AudioContext outside a user gesture.** Call `initAudio()` only inside a click/tap handler. Browsers block AudioContext created on page load.
- **Always mirror x-axis on MediaPipe coordinates.** Raw MediaPipe x is 0 (left of camera) to 1 (right of camera), which is flipped from the user's perspective. Always apply `x = (1 - landmark.x) * canvasWidth` before any zone comparison or drawing.
- **JWT middleware on all protected routes.** `requireAuth` from `backend/middleware/auth.js` must be applied to all `/api/sessions` and `/api/ai` routes. Never skip it for convenience.
- **No BaaS.** Do not introduce Supabase, Firebase, or any backend-as-a-service. The Express + PostgreSQL stack is intentional.
