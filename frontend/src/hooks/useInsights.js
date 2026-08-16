import { useEffect, useRef, useState } from "react";
import { fetchInsights } from "../api/client";

/**
 * Fetches real rule-based insights from GET /api/insights.
 * No mock/random data - purely reflects what the backend computed
 * from SQLite-stored metrics history.
 *
 * @param {number} limit - max history rows the backend should analyze
 * @param {number} refreshInterval - ms between automatic re-fetches (0 disables polling)
 */
export function useInsights(limit = 100, refreshInterval = 5000) {
  const [insights, setInsights] = useState([]);
  const [sampleCount, setSampleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function load({ showLoadingState }) {
      if (showLoadingState) setLoading(true);
      setError(null);
      try {
        const data = await fetchInsights(limit);
        if (!isMountedRef.current) return;
        setInsights(Array.isArray(data?.insights) ? data.insights : []);
        setSampleCount(typeof data?.sample_count === "number" ? data.sample_count : 0);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err?.message || "Failed to load insights");
      } finally {
        if (isMountedRef.current && showLoadingState) {
          setLoading(false);
        }
      }
    }

    load({ showLoadingState: true });

    let intervalId = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        load({ showLoadingState: false });
      }, refreshInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [limit, refreshInterval]);

  return { insights, sampleCount, loading, error };
}
