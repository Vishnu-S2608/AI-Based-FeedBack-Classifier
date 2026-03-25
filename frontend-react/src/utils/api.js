const API_BASE = "http://localhost:5000";

export async function analyzeFeedback(text) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("Analysis failed");
  return response.json();
}

export async function getAllFeedbacks() {
  const response = await fetch(`${API_BASE}/get-feedbacks`);
  if (!response.ok) throw new Error("Failed to load feedbacks");
  return response.json();
}

export async function getDashboardStats() {
  const response = await fetch(`${API_BASE}/dashboard-stats`);
  if (!response.ok) throw new Error("Failed to load stats");
  return response.json();
}

export async function getDashboardInsights() {
  const response = await fetch(`${API_BASE}/dashboard-insights`);
  if (!response.ok) throw new Error("Failed to load insights");
  return response.json();
}

export async function deleteFeedback(id) {
  const response = await fetch(`${API_BASE}/delete-feedback/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Delete failed");
  return response.json();
}

export async function batchAnalyze(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/batch-analyze`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Batch analysis failed");
  return response.json();
}

export function getExportCSVUrl(category = "") {
  const params = category ? `?category=${category}` : "";
  return `${API_BASE}/export/csv${params}`;
}

export function getExportPDFUrl(category = "") {
  const params = category ? `?category=${category}` : "";
  return `${API_BASE}/export/pdf${params}`;
}

export function getSampleCSVUrl() {
  return `${API_BASE}/sample-csv`;
}
