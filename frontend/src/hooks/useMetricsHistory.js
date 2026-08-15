import { useEffect, useRef, useState } from "react";
import { fetchMetricsHistory } from "../api/client";

/**
 * Fetches real historical metrics from GET /api/metrics/history.
 * No mock/random data - purely reflects what SQLite has stored.
 *
 * @param {number} limit - max number of records to fetch (default 100)
 * @param {number} refreshInterval - ms between automatic re-fetches.
 *   Pass 0 or omit to disable polling (fetch once on mount, same as before).
 * @returns {{ history: Array, loading: boolean, error: string|null }}
 */
export function useMetricsHistory(limit = 100, refreshInterval = 0) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function loadHistory({ showLoadingState }) {
      if (showLoadingState) setLoading(true);
      setError(null);

      try {
        const data = await fetchMetricsHistory(limit);

        if (!isMountedRef.current) return;

        setHistory(Array.isArray(data?.records) ? data.records : []);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err?.message || "Failed to load metrics history");
      } finally {
        if (isMountedRef.current && showLoadingState) {
          setLoading(false);
        }
      }
    }

    // Initial fetch shows the loading state
    loadHistory({ showLoadingState: true });

    let intervalId = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        // Background refreshes don't flip loading back to true,
        // so the chart doesn't flash/reset on every tick
        loadHistory({ showLoadingState: false });
      }, refreshInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [limit, refreshInterval]);

  return { history, loading, error };
}