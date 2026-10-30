/**
 * API service helper for the AI-Based Smart Recycling System.
 * Connects to the FastAPI backend via configured proxy or relative paths.
 */

const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
// Automatically ensure the API base has /api at the end without double slashes
const API_BASE = rawBase.replace(/\/+$/, '').endsWith('/api')
  ? rawBase.replace(/\/+$/, '')
  : (rawBase === '' ? '/api' : `${rawBase.replace(/\/+$/, '')}/api`);

export async function checkSystemHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function uploadAndClassifyImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/classify`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Classification error (${res.status})`);
  }

  return res.json();
}

export async function manualClassify(category, itemName = '', notes = '') {
  const res = await fetch(`${API_BASE}/manual-select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, item_name: itemName, notes }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Manual classification error (${res.status})`);
  }

  return res.json();
}

export async function correctClassification(recordId, category, itemName = '', notes = '') {
  const res = await fetch(`${API_BASE}/correct/${recordId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, item_name: itemName, notes }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Correction error (${res.status})`);
  }

  return res.json();
}

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

export async function getHistory(page = 1, pageSize = 10, category = '', method = '', search = '') {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (category && category !== 'all') params.append('category', category);
  if (method && method !== 'all') params.append('method', method);
  if (search.trim()) params.append('search', search.trim());

  const res = await fetch(`${API_BASE}/history?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
}

export async function getHistoryDetail(recordId) {
  const res = await fetch(`${API_BASE}/history/${recordId}`);
  if (!res.ok) throw new Error(`Failed to load record #${recordId}`);
  return res.json();
}

export async function deleteHistoryRecord(recordId) {
  const res = await fetch(`${API_BASE}/history/${recordId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete record #${recordId}`);
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history?confirm=true`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear history');
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function getGuidelines() {
  const res = await fetch(`${API_BASE}/guidelines`);
  if (!res.ok) throw new Error('Failed to load guidelines');
  return res.json();
}
