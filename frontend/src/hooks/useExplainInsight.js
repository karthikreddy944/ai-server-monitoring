import { useCallback, useEffect, useRef, useState } from "react";
import { explainInsight } from "../api/client";

/**
 * Manual-trigger hook for the on-demand LLM explanation endpoint.
 * POST /api/insights/explain
 *
 * There is NO polling and NO automatic request on mount - the request
 * only fires when the returned `explain()` function is called (e.g. from
 * a button click).
 *
 * @returns {{ result: object|null, loading: boolean, error: string|null, explain: (metric?: string|null) => Promise<void> }}
 */
export function useExplainInsight() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const explain = useCallback(async (metric) => {
    setLoading(true);
    setError(null);
    try {
      const data = await explainInsight(metric);
      if (!isMountedRef.current) return;
      setResult(data);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err?.message || "Failed to generate AI explanation");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return { result, loading, error, explain };
}
