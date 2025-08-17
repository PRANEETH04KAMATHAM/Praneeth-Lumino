// server/src/services/groq.js
const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DEFAULT_MODEL = 'llama-3.1-8b-instant';

async function summarize(originalText, prompt, model = DEFAULT_MODEL) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');
  if (typeof originalText !== 'string' || !originalText.trim()) throw new Error('originalText is required');
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('prompt is required');

  const messages = [
    {
      role: 'system',
      content:
        'You summarize meeting transcripts. Output concise, structured text. ' +
        'If asked for action items, output only checklist lines starting with "- [ ] ". ' +
        'No code fences or images. Avoid placeholders like [Insert ...]. Only include info present.',
    },
    {
      role: 'user',
      content: `Context:\n${originalText}\n\nInstruction:\n${prompt}\n\nConstraints: <=400 words unless asked otherwise.`,
    },
  ];

  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
    max_tokens: 800,
  });

  const text = resp?.choices?.[0]?.message?.content?.trim() || '';
  return { text, model };
}

module.exports = { summarize };
