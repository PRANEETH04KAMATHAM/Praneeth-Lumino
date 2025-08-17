# Meeting Summarizer

A minimal full‑stack app to:
- Accept a text transcript (paste or .txt upload)
- Accept a custom instruction/prompt
- Generate a concise AI summary
- Let users edit the result
- Send the edited summary via email (SMTP)

## Features

- Paste or upload .txt transcripts
- Custom prompt input (kept simple)
- AI summary via Groq models
- Editable summary with autosanitized formatting
- Email delivery over SMTP (Gmail, Microsoft 365, or any SMTP)

## Tech Stack

- Backend: Node.js, Express, MongoDB (native driver)
- AI: Groq SDK (configurable model)
- Email: SMTP via Nodemailer
- Frontend: React (Vite)

## Project Structure

- server/
  - src/
    - index.js — Express bootstrap
    - db.js — MongoDB connection (native driver)
    - routes/
      - summaries.js — REST API (create, update, get, send)
    - data/
      - summaries.js — CRUD helpers
    - services/
      - groq.js — AI summarize helper
      - email.js — SMTP send helper
  - .env — environment variables
- client/
  - src/
    - App.jsx — UI: transcript input, .txt upload, prompt, generate/save/send
    - api.js — minimal fetch helpers
    - main.jsx — mount App

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- MongoDB (Atlas or local). App runs without DB, but won’t persist summaries.
- Groq API key
- SMTP credentials (Gmail App Password, Microsoft 365, or other SMTP)

## Setup

1) Install dependencies

- Backend:
  - cd server
  - npm install

- Frontend:
  - cd client
  - npm install

2) Configure server/.env

Copy this example and replace placeholders:

PORT=8080

# MongoDB (optional; without this, data won't persist)
MONGODB_URI=your_mongodb_uri
MONGODB_DB=lumio_summarizer

# Groq
GROQ_API_KEY=your_groq_key

# SMTP — choose a provider and fill in values

# Gmail (requires 2‑Step Verification + App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your_16_char_app_password
EMAIL_FROM=Meeting Summarizer 

# Microsoft 365 (alternative)
# SMTP_HOST=smtp.office365.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=youraddress@yourtenant.onmicrosoft.com
# SMTP_PASS=your_password_or_app_password
# EMAIL_FROM=Meeting Summarizer 

Notes:
- One variable per line, no quotes, no extra spaces.
- EMAIL_FROM should be a valid mailbox you control.
- Gmail requires an App Password (not your normal password).

## Run

Backend:
- cd server
- npm run dev
- Health check: open http://localhost:8080/api/status

Frontend:
- cd client
- npm run dev
- Open the printed local URL

## Usage

- Transcript
  - Paste text into the Transcript box, or
  - Upload a .txt file (auto‑fills Transcript)
- Prompt
  - Type a simple instruction (e.g., “Dot bullets. Focus on risks and next steps.”)
- Generate
  - Click Generate to get a summary
- Edit
  - Adjust the summary in “Summary (editable)”
- Save
  - Click Save to persist (requires MongoDB configured)
- Send
  - Enter recipient emails (comma‑separated) and click Send Email

## Formatting

- The client normalizes model output to clean dot bullets (- ).
- It strips Markdown headings/bold/italics, checkboxes, and converts numbered/asterisk/dash bullets into dot bullets.
- Emails will match the normalized formatting shown in the app.

## API

- POST /api/summaries
  - Body: { originalText, prompt, model? }
  - Returns: created document with resultText

- PATCH /api/summaries/:id
  - Body: { resultText }
  - Returns: updated document

- GET /api/summaries/:id
  - Returns: document by id

- POST /api/summaries/:id/send
  - Body: { recipients: string[], subject?: string }
  - Sends the summary via SMTP; returns { sent: true, emailId }

## Troubleshooting

- GROQ_API_KEY not set
  - Add to server/.env and restart backend.

- Mongo connect failed
  - Check MONGODB_URI; without it, API runs but won’t persist.

- Email auth failed
  - Verify SMTP host/port/secure/user/pass. For Gmail, use an App Password.

- CORS error
  - Backend enables CORS; ensure frontend points to http://localhost:8080/api.

- Payload too large
  - Backend JSON limit is 2MB. For very large transcripts, consider chunking or a server upload endpoint.

## Customization

- Bullet style
  - Adjust the client normalizer to use hyphens or numbers.

- Models
  - Change default in server/src/services/groq.js; optionally add a model dropdown in the UI.

- Storage
  - Replace MongoDB logic in server/src/data/summaries.js to use another DB.

- File types
  - Add PDF/DOCX parsing on the backend if needed for richer uploads.

## Scripts

Backend (server):
- npm run dev — start backend (auto‑reload if configured)
- npm start — start with node

Frontend (client):
- npm run dev — Vite dev server
- npm run build — production build
- npm run preview — preview build

## Security

- Do not commit .env or secrets.
- Use least‑privilege SMTP credentials.
- Consider auth/rate limiting for production.
- Sanitize inputs if switching to HTML emails later.

## License

Add your preferred license (e.g., MIT).