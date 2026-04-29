const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Users
async function createUser(email, passwordHash) {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  return rows[0] ?? null;
}

// Sessions
async function createSession(userId, instrument, noteEvents, durationSeconds) {
  const { rows } = await pool.query(
    `INSERT INTO sessions (user_id, instrument, note_events, duration_seconds)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, instrument, JSON.stringify(noteEvents), durationSeconds]
  );
  return rows[0];
}

async function getSessionsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function getSessionById(id, userId) {
  const { rows } = await pool.query(
    'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rows[0] ?? null;
}

// Backing tracks
async function saveBackingTrack(sessionId, claudePrompt, generatedDescription) {
  const { rows } = await pool.query(
    `INSERT INTO backing_tracks (session_id, claude_prompt, generated_description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [sessionId, claudePrompt, generatedDescription]
  );
  return rows[0];
}

async function getBackingTrackBySession(sessionId) {
  const { rows } = await pool.query(
    'SELECT * FROM backing_tracks WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
    [sessionId]
  );
  return rows[0] ?? null;
}

module.exports = {
  createUser,
  findUserByEmail,
  createSession,
  getSessionsByUser,
  getSessionById,
  saveBackingTrack,
  getBackingTrackBySession,
};
