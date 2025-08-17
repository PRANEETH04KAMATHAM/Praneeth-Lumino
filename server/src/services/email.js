// server/src/services/email.js
const nodemailer = require('nodemailer');

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials missing: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE || '').toLowerCase() === 'true', // true for 465
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function getFrom() {
  return process.env.EMAIL_FROM || 'Meeting Summarizer <no-reply@example.com>';
}

async function sendSummaryEmail(to, subject, bodyText) {
  const transporter = getTransport();
  const from = getFrom();
  const info = await transporter.sendMail({ from, to, subject, text: bodyText });
  return { id: info.messageId || null };
}

module.exports = { sendSummaryEmail };
