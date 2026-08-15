import { useMemo } from "react";
import { useMetricsHistory } from "../hooks/useMetricsHistory";
import ResourceUsage from "../components/ResourceUsage";

const METRICS = [
  { key: "cpu", label: "CPU" },
  { key: "ram", label: "RAM" },
  { key: "disk", label: "Disk" },
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

/**
 * Computes avg/max/sample-count for one field, ignoring any
 * non-numeric values instead of letting them skew the result.
 */
function summarizeField(records, field) {
  const values = records
    .map((r) => r[field])
    .filter((v) => typeof v === "number" && Number.isFinite(v));

  if (values.length === 0) {
    return { avg: null, max: null, count: 0 };
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);

  return { avg, max, count: values.length };
}

function buildTimeRange(records) {
  const withTimestamps = records
    .filter((r) => r.timestamp)
    .map((r) => new Date(r.timestamp))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);

  if (withTimestamps.length === 0) return null;

  const first = withTimestamps[0];
  const last = withTimestamps[withTimestamps.length - 1];

  return { first, last };
}

export default function Analytics() {
  const { history, loading, error } = useMetricsHistory(100);

  const summary = useMemo(() => {
    const byField = {};
    for (const m of METRICS) {
      byField[m.key] = summarizeField(history, m.key);
    }
    return byField;
  }, [history]);

  const timeRange = useMemo(() => buildTimeRange(history), [history]);
  const hasAnyData = history.length > 0;

  return (
    <div className="page">
      <header className="page-head">
        <h1>Analytics</h1>
        <p>Historical performance trends</p>
      </header>

      {loading && (
        <>
          <div className="skeleton sk-status" />
          <div className="analytics-grid">
            {METRICS.map((m) => (
              <div key={m.key} className="skeleton sk-card" />
            ))}
          </div>
          <div className="skeleton sk-panel" />
        </>
      )}

      {!loading && error && (
        <section className="page-error">
          <h2>Unable to load historical data</h2>
          <p className="page-error__detail">{error}</p>
        </section>
      )}

      {!loading && !error && !hasAnyData && (
        <section className="info-panel">
          <h2>No historical data available yet</h2>
          <p>Metrics will appear here once the collector has stored samples in SQLite.</p>
        </section>
      )}

      {!loading && !error && hasAnyData && (
        <>
          <section className="analytics-summary">
            <h2 className="analytics-summary__title">System Overview</h2>

            <div className="analytics-grid">
              {METRICS.map((m) => {
                const { avg } = summary[m.key];
                return (
                  <div key={m.key} className="analytics-card">
                    <span className="analytics-card__label">Avg {m.label}</span>
                    <span className="analytics-card__value">
                      {avg === null ? "—" : `${avg.toFixed(2)}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="analytics-grid">
              {METRICS.map((m) => {
                const { max } = summary[m.key];
                return (
                  <div key={m.key} className="analytics-card">
                    <span className="analytics-card__label">Peak {m.label}</span>
                    <span className="analytics-card__value">
                      {max === null ? "—" : `${max.toFixed(2)}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="analytics-meta">
              <span>
                Samples: <strong>{history.length}</strong>
              </span>
              {timeRange && (
                <span>
                  Period:{" "}
                  <strong>
                    {formatTime(timeRange.first)} – {formatTime(timeRange.last)}
                  </strong>
                </span>
              )}
            </div>
          </section>

          <ResourceUsage history={history} loading={loading} error={error} />
        </>
      )}
    </div>
  );
}