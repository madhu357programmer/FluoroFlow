const API_BASE = "http://localhost:8000";

export function imageUrl(path) {
  if (!path) return "";
  return `${API_BASE}${path}`;
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Backend not reachable");
  return res.json();
}

export async function analyzeSample({ sampleName, location, file }) {
  const formData = new FormData();
  formData.append("sample_name", sampleName);
  formData.append("location", location);
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}

export async function runDemo(level) {
  const res = await fetch(`${API_BASE}/api/demo/${level}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Demo run failed" }));
    throw new Error(err.detail || "Demo run failed");
  }
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_BASE}/api/history`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function getHistoryItem(id) {
  const res = await fetch(`${API_BASE}/api/history/${id}`);
  if (!res.ok) throw new Error("Failed to load sample");
  return res.json();
}
