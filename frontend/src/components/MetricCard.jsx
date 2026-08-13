import StatusBadge from "./StatusBadge";
import Sparkline from "./Sparkline";
import { getStatusFromValue } from "../utils/metricsStatus";

const DESCRIPTIONS = { CPU: "Processor utilization", RAM: "Memory utilization", DISK: "Storage utilization" };

export default function MetricCard({ label, value, unit = "percent", samples = [] }) {
  const status = getStatusFromValue(value);
  return (
    <article className="metric-card">
      <div className="metric-card__top">
        <span className="metric-card__label">{label}</span>
        <StatusBadge status={status} />
      </div>
      <div className="metric-card__value-row">
        <span className="metric-card__value">{value.toFixed(1)}</span>
        <span className="metric-card__unit">{unit === "percent" ? "%" : unit}</span>
      </div>
      <div className="metric-card__bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={`metric-card__bar-fill metric-card__bar-fill--${status}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <div className="metric-card__sparkline"><Sparkline data={samples} /></div>
      <p className="metric-card__desc">{DESCRIPTIONS[label] || "Resource utilization"}</p>
    </article>
  );
}