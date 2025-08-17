// client/src/api.js
const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = data && data.error ? data.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function createSummary(originalText, prompt, model) {
  return request('/summaries', {
    method: 'POST',
    body: JSON.stringify({ originalText, prompt, model }),
  });
}

export async function updateSummary(id, resultText) {
  return request(`/summaries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ resultText }),
  });
}

export async function sendSummary(id, recipients, subject) {
  return request(`/summaries/${id}/send`, {
    method: 'POST',
    body: JSON.stringify({ recipients, subject }),
  });
}

export async function getSummary(id) {
  return request(`/summaries/${id}`, { method: 'GET' });
}
