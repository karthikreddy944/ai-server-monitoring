import { useState, useEffect } from "react";
import { fetchMetricsSummary } from "../api/client";

export function useMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      try {
        setError(null);
        const data = await fetchMetricsSummary();

        if (isMounted) {
          setMetrics(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch metrics");
          setLoading(false);
        }
      }
    }

    loadMetrics();

    const intervalId = setInterval(loadMetrics, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { metrics, loading, error };
}