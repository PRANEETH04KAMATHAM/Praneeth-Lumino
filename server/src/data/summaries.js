// server/src/data/summaries.js
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const COLLECTION = 'summaries';

function shapeNewSummary(doc) {
  if (!doc || typeof doc !== 'object') throw new Error('Invalid summary payload');

  const originalText = String(doc.originalText || '').trim();
  const prompt = String(doc.prompt || '').trim();
  const model = (doc.model && String(doc.model).trim()) || 'llama-3.3-70b-versatile';
  const resultText = typeof doc.resultText === 'string' ? doc.resultText : '';

  if (!originalText) throw new Error('originalText is required');
  if (!prompt) throw new Error('prompt is required');

  const recipients = Array.isArray(doc.recipients)
    ? doc.recipients.map(String).map(s => s.trim()).filter(Boolean)
    : [];

  const now = new Date();

  return {
    originalText,
    prompt,
    model,
    resultText,
    recipients,
    createdAt: now,
    updatedAt: now,
  };
}

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error('Invalid summary id');
    err.status = 400;
    throw err;
  }
}

async function createSummary(doc) {
  const db = getDb();
  const payload = shapeNewSummary(doc);
  const result = await db.collection(COLLECTION).insertOne(payload);
  return { _id: result.insertedId, ...payload };
}

async function updateSummary(id, patch) {
  const db = getDb();
  const _id = toObjectId(id);

  const set = {};
  if (typeof patch?.resultText === 'string') set.resultText = patch.resultText;
  set.updatedAt = new Date();

  await db.collection(COLLECTION).updateOne({ _id }, { $set: set });
  return await db.collection(COLLECTION).findOne({ _id });
}

async function getSummary(id) {
  const db = getDb();
  const _id = toObjectId(id);
  return await db.collection(COLLECTION).findOne({ _id });
}

module.exports = { createSummary, updateSummary, getSummary };
