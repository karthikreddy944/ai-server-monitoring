import StatusBadge from "../components/StatusBadge";
import { useMetricsContext } from "../context/MetricsContext";
import { getStatusFromValue, getStatusLabel } from "../utils/metricsStatus";

function BigCard({ label, value, desc }) {
  const status = getStatusFromValue(value);
  return (
    <article className="monitor-card">
      <div className="monitor-card__head"><h3>{label}</h3><StatusBadge status={status} label={getStatusLabel(status)} /></div>
      <p className="monitor-card__val">{value.toFixed(2)}<span>%</span></p>
      <div className="monitor-card__bar"><div className={`monitor-card__fill monitor-card__fill--${status}`} style={{ width: `${Math.min(value, 100)}%` }} /></div>
      <p className="monitor-card__desc">{desc}</p>
    </article>
  );
}

export default function Monitoring() {
  const { metrics, loading, error } = useMetricsContext();
  if (loading && !metrics) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error && !metrics) return <div className="page-error"><h1>Monitoring unavailable</h1><p>{error}</p></div>;

  return (
    <div className="page">
      <header className="page-head"><h1>Monitoring</h1><p>Live resource telemetry</p></header>
      {error && <div className="stale-banner">Last update failed. Showing last known values.</div>}
      <div className="monitor-grid">
        <BigCard label="CPU" value={metrics.cpu.value} desc="Processor utilization" />
        <BigCard label="RAM" value={metrics.ram.value} desc="Memory utilization" />
        <BigCard label="Disk" value={metrics.disk.value} desc="Storage utilization" />
      </div>
    </div>
  );
}