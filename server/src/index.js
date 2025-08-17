// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongo } = require('./db');
const summariesRouter = require('./routes/summaries');

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB || 'lumio_summarizer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/status', (_req, res) => {
  res.json({ ok: true, service: 'meeting-summarizer-api', time: new Date().toISOString() });
});

app.use('/api/summaries', summariesRouter);

app.listen(PORT, async () => {
  console.log(`API listening on http://localhost:${PORT}`);
  try {
    await connectMongo(MONGODB_URI, DB_NAME);
  } catch (e) {
    console.error('Mongo connect failed:', e.message);
  }
});
