const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const requireAuth = require('../middleware/auth');
const { getSessionById, saveBackingTrack } = require('../db/queries');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.use(requireAuth);

router.get('/backing-track/:sessionId', async (req, res) => {
  const session = await getSessionById(req.params.sessionId, req.userId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const noteList = (session.note_events ?? [])
    .filter(e => e.type === 'note')
    .map(e => e.note)
    .join(', ');

  const drumList = (session.note_events ?? [])
    .filter(e => e.type === 'drum')
    .map(e => e.drum)
    .join(', ');

  const prompt = `A musician just played ${session.instrument} using hand gestures.
Instrument: ${session.instrument}
Notes played: ${noteList || 'none recorded'}
Drum hits: ${drumList || 'none recorded'}
Session duration: ${session.duration_seconds}s

Describe a complementary backing track for this performance. Include: tempo, key, chord progression, rhythm section, and any melodic or harmonic elements that would complement the notes played. Be specific and musical. Keep the description to 3-4 paragraphs.`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  let fullText = '';

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullText += chunk;
        res.write(chunk);
      }
    }

    await saveBackingTrack(session.id, prompt, fullText);
    res.end();
  } catch (err) {
    console.error('Claude streaming error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI generation failed' });
    } else {
      res.end();
    }
  }
});

module.exports = router;
