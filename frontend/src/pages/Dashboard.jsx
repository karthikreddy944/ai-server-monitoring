import { useEffect, useState } from "react";
import { useMetricsContext } from "../context/MetricsContext";
import { useMetricSamples } from "../hooks/useMetricSamples";
import { useMetricsHistory } from "../hooks/useMetricsHistory"; // NEW
import TopBar from "../components/TopBar";
import SystemStatus from "../components/SystemStatus";
import MetricCard from "../components/MetricCard";
import ResourceUsage from "../components/ResourceUsage";
import { getOverallStatus } from "../utils/metricsStatus";

function DashboardSkeleton() {
  return (
    <div className="page page--loading">
      <div className="skeleton sk-heading" />
      <div className="skeleton sk-status" />
      <div className="metric-grid">{[1, 2, 3].map((i) => <div key={i} className="skeleton sk-card" />)}</div>
      <div className="skeleton sk-panel" />
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="page-error">
      <h1>Unable to load system metrics</h1>
      <p>The monitoring service could not retrieve the latest metrics.</p>
      {message && <p className="page-error__detail">{message}</p>}
      <button type="button" onClick={onRetry}>Retry</button>
    </div>
  );
}

function DashboardContent({ onRetry }) {
  const { metrics, loading, error } = useMetricsContext();
  const samples = useMetricSamples(metrics);
  const { history, loading: historyLoading, error: historyError } = useMetricsHistory(100, 5000);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [, tick] = useState(0);

  useEffect(() => { if (metrics) setLastUpdated(new Date()); }, [metrics]);
  useEffect(() => { const id = setInterval(() => tick((t) => t + 1), 1000); return () => clearInterval(id); }, []);

  if (loading && !metrics) return <DashboardSkeleton />;
  if (error && !metrics) return <DashboardError message={error} onRetry={onRetry} />;

  const overallStatus = getOverallStatus(metrics);
  const isLive = Boolean(metrics && !error);

  return (
    <div className="page">
      {error && metrics && (
        <div className="stale-banner" role="alert">
          <strong>Last update failed.</strong> Showing last known values.
        </div>
      )}
      <TopBar lastUpdated={lastUpdated} isLive={isLive} />
      <SystemStatus status={overallStatus} metrics={metrics} />
      <section className="metric-grid">
        <MetricCard label="CPU" value={metrics.cpu.value} unit={metrics.cpu.unit} samples={samples.cpu} />
        <MetricCard label="RAM" value={metrics.ram.value} unit={metrics.ram.unit} samples={samples.ram} />
        <MetricCard label="DISK" value={metrics.disk.value} unit={metrics.disk.unit} samples={samples.disk} />
      </section>
      <ResourceUsage history={history} loading={historyLoading} error={historyError} /> {/* CHANGED */}
    </div>
  );
}

export default function Dashboard() {
  const [retryKey, setRetryKey] = useState(0);
  return <DashboardContent key={retryKey} onRetry={() => setRetryKey((k) => k + 1)} />;
}