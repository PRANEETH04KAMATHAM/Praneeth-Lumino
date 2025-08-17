// client/src/App.jsx
import { useState } from 'react';
import { createSummary, updateSummary, sendSummary } from './api';

export default function App() {
  const [originalText, setOriginalText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('llama-3.1-8b-instant');
  const [doc, setDoc] = useState(null);
  const [resultText, setResultText] = useState('');
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('Meeting Summary');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Normalize -> only dot bullets (•) and plain text
  const normalizeToDotsNoHeadings = (s) => {
  if (!s) return '';

  return s
    .split(/\r?\n/)
    .map(line => {
      let l = line.trim();
      if (!l) return '';

      // Remove markdown/formatting
      l = l
        .replace(/^\s*[-*#>\d\.\)\[\]]+\s*/g, '• ') // bullets, numbers, checkboxes → bullet
        .replace(/\*\*(.*?)\*\*/g, '$1')            // bold → plain
        .replace(/\*(.*?)\*/g, '$1')                // italic → plain
        .replace(/__(.*?)__/g, '$1')                // __bold__ → plain
        .replace(/_(.*?)_/g, '$1');                 // _italic_ → plain

      // Remove extra spaces
      return l.replace(/\s+/g, ' ').trim();
    })
    .join('\n')
    .trim();
};


  async function onGenerate() {
    if (!originalText.trim() || !prompt.trim()) {
      setMsg('Please enter Transcript and Prompt.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const created = await createSummary(originalText, prompt, model);
      setDoc(created);
      setResultText(normalizeToDotsNoHeadings(created.resultText || ''));
      setMsg('Generated summary.');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    if (!doc?._id) return;
    setLoading(true);
    setMsg('');
    try {
      const cleaned = normalizeToDotsNoHeadings(resultText);
      const updated = await updateSummary(doc._id, cleaned);
      setDoc(updated);
      setResultText(cleaned);
      setMsg('Saved.');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSend() {
    if (!doc?._id) return;
    const to = recipients.split(',').map(s => s.trim()).filter(Boolean);
    if (to.length === 0) {
      setMsg('Enter at least one recipient email.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await sendSummary(doc._id, to, subject);
      setMsg(res.sent ? `Email sent (id: ${res.emailId || 'n/a'})` : 'Send failed');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'text/plain' && !file.name.toLowerCase().endsWith('.txt')) {
      setMsg('Only .txt files are supported right now.');
      e.target.value = '';
      return;
    }
    setMsg('Reading file…');
    try {
      const text = await file.text();
      setOriginalText(text);
      setMsg('File loaded.');
    } catch {
      setMsg('Failed to read file.');
    } finally {
      e.target.value = '';
    }
  }

  const inputStyle = { width: '100%', marginBottom: 12, padding: 8, boxSizing: 'border-box' };
  const buttonStyle = { marginRight: 8, padding: '8px 12px' };
  const container = { maxWidth: 900, margin: '24px auto', padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' };

  return (
    <div style={container}>
      <h2>Meeting Summarizer</h2>

      <label>Transcript</label>
      <textarea
        value={originalText}
        onChange={e => setOriginalText(e.target.value)}
        rows={6}
        style={inputStyle}
        placeholder="Paste meeting transcript or notes..."
      />
      <div style={{ marginBottom: 12 }}>
        <input type="file" accept=".txt,text/plain" onChange={onFileChange} />
        <div style={{ fontSize: 12, color: '#666' }}>Upload a .txt file to auto-fill the transcript.</div>
      </div>

      <label>Prompt</label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={3}
        style={inputStyle}
        placeholder="Describe how you want the summary (e.g., 'Dot bullets. Focus on risks and next steps')."
      />

      <label>Model</label>
      <input
        value={model}
        onChange={e => setModel(e.target.value)}
        style={inputStyle}
        placeholder="llama-3.1-8b-instant"
      />

      <button onClick={onGenerate} disabled={loading || !originalText.trim() || !prompt.trim()} style={buttonStyle}>
        {loading ? 'Working...' : 'Generate'}
      </button>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}

      <hr style={{ margin: '16px 0' }} />

      <label>Summary (editable)</label>
      <textarea
        value={resultText}
        onChange={e => setResultText(e.target.value)}
        rows={10}
        style={inputStyle}
        placeholder="Generated summary will appear here; you can edit before saving/sending."
      />

      <button onClick={onSave} disabled={loading || !doc?._id} style={buttonStyle}>
        {loading ? 'Saving...' : 'Save'}
      </button>

      <hr style={{ margin: '16px 0' }} />

      <label>Recipients (comma-separated)</label>
      <input
        value={recipients}
        onChange={e => setRecipients(e.target.value)}
        style={inputStyle}
        placeholder="alice@example.com, bob@example.com"
      />

      <label>Subject</label>
      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        style={inputStyle}
      />

      <button onClick={onSend} disabled={loading || !doc?._id || !recipients.trim()} style={buttonStyle}>
        {loading ? 'Sending...' : 'Send Email'}
      </button>
    </div>
  );
}
