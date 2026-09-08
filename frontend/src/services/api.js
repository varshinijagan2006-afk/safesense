const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Login failed');
  }
  return await response.json();
}

export async function analyzeIncident(data) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Unable to analyze incident');
  }
  return await response.json();
}

export async function saveIncident(incidentData) {
  const response = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentData)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to save incident');
  }
  return await response.json();
}

export async function getIncidents(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category && params.category !== 'ALL') query.append('category', params.category);
  if (params.severity && params.severity !== 'ALL') query.append('severity', params.severity);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.review_status && params.review_status !== 'ALL') query.append('review_status', params.review_status);

  const response = await fetch(`${API_BASE}/incidents?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }
  return await response.json();
}

export async function getIncidentById(id) {
  const response = await fetch(`${API_BASE}/incidents/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch incident details');
  }
  return await response.json();
}

export async function updateIncidentStatus(id, status) {
  const response = await fetch(`${API_BASE}/incidents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    throw new Error('Failed to update incident status');
  }
  return await response.json();
}

export async function reviewIncident(id, reviewData) {
  const response = await fetch(`${API_BASE}/incidents/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to record safety review');
  }
  return await response.json();
}

export async function deleteIncident(id) {
  const response = await fetch(`${API_BASE}/incidents/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete incident');
  }
  return await response.json();
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE}/analytics`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return await response.json();
}

export function getReportDownloadUrl(id) {
  return `${API_BASE}/reports/${id}`;
}

export async function getMLStatus() {
  const response = await fetch(`${API_BASE}/ml/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch ML model status');
  }
  return await response.json();
}

export async function getFeatureImportance() {
  const response = await fetch(`${API_BASE}/ml/feature-importance`);
  if (!response.ok) {
    throw new Error('Failed to fetch ML feature importances');
  }
  return await response.json();
}

export async function retrainModel() {
  const response = await fetch(`${API_BASE}/ml/retrain`, {
    method: 'POST'
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Model retraining failed');
  }
  return await response.json();
}
