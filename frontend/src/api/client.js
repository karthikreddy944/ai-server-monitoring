const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Call FastAPI health check — use this to verify backend connection.
 * Dashboard will use getMetricsSummary() in Day 3 Part 2.
 */
export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch CPU, RAM, and disk from FastAPI.
 * GET /api/metrics/summary
 *
 * Uses Vite dev proxy (/api -> http://localhost:8000).
 * Returns: { cpu: { value, unit, instance }, ram: {...}, disk: {...} }
 */
export async function fetchMetricsSummary() {
  const response = await fetch("/api/metrics/summary");

  if (!response.ok) {
    throw new Error(`Metrics summary failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchMetricsHistory(limit = 100) {
  const response = await fetch(`/api/metrics/history?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Metrics history failed: ${response.status}`);
  }

  return response.json();
}
/**
 * Fetch rule-based insights derived from real stored metrics.
 * GET /api/insights
 */
export async function fetchInsights(limit = 100) {
  const response = await fetch(`/api/insights?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Insights fetch failed: ${response.status}`);
  }

  return response.json();
}