const express = require('express');
const requireAuth = require('../middleware/auth');
const { createSession, getSessionsByUser, getSessionById } = require('../db/queries');

const router = express.Router();

router.use(requireAuth);

router.post('/', async (req, res) => {
  const { instrument, note_events, duration_seconds } = req.body;
  if (!instrument) return res.status(400).json({ error: 'instrument required' });

  try {
    const session = await createSession(req.userId, instrument, note_events ?? [], duration_seconds ?? 0);
    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

router.get('/', async (req, res) => {
  try {
    const sessions = await getSessionsByUser(req.userId);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = await getSessionById(req.params.id, req.userId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;
