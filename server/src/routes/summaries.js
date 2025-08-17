// server/src/routes/summaries.js
const express = require('express');
const { z } = require('zod');
const { summarize } = require('../services/groq');
const { createSummary, updateSummary, getSummary } = require('../data/summaries');
const { sendSummaryEmail } = require('../services/email');

const router = express.Router();

const createSchema = z.object({
  originalText: z.string().min(1, 'Transcript is required').max(50000, 'Transcript too long'),
  prompt: z.string().min(1, 'Prompt is required').max(2000),
  model: z.string().optional(),
});

router.post('/', async (req, res) => {
  try {
    const { originalText, prompt, model } = createSchema.parse(req.body);
    const { text: resultText, model: usedModel } = await summarize(originalText, prompt, model);
    const doc = await createSummary({
      originalText,
      prompt,
      model: usedModel,
      resultText,
      recipients: [],
    });
    res.status(201).json(doc);
  } catch (e) {
    const status = e.name === 'ZodError' ? 400 : 500;
    res.status(status).json({ error: e.message });
  }
});

const updateSchema = z.object({
  resultText: z.string().min(1, 'Summary cannot be empty').max(50000),
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { resultText } = updateSchema.parse(req.body);
    const updated = await updateSummary(id, { resultText });
    res.json(updated);
  } catch (e) {
    const status = e.name === 'ZodError' ? 400 : 500;
    res.status(status).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await getSummary(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send summary by email via SMTP
const sendSchema = z.object({
  recipients: z.array(z.string().email('Invalid email')).min(1, 'At least one recipient required'),
  subject: z.string().min(1).max(200).optional(),
});

router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { recipients, subject } = sendSchema.parse(req.body);

    const doc = await getSummary(id);
    if (!doc) return res.status(404).json({ error: 'Summary not found' });

    const bodyText = [
      'Meeting Summary',
      '',
      doc.resultText || '(empty)',
      '',
      '--',
      'Sent via Meeting Summarizer',
    ].join('\n');

    const data = await sendSummaryEmail(recipients, subject || 'Meeting Summary', bodyText);
    res.json({ sent: true, emailId: data?.id || null });
  } catch (e) {
    const status = e.name === 'ZodError' ? 400 : 500;
    res.status(status).json({ error: e.message });
  }
});

module.exports = router;
