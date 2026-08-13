import { getStatusLabel } from "../utils/metricsStatus";

const STATUS_CLASS = {
  healthy: "status-badge--healthy",
  warning: "status-badge--warning",
  critical: "status-badge--critical",
};

export default function StatusBadge({ status, label, showDot = true, className = "" }) {
  const text = label || getStatusLabel(status);
  const statusClass = STATUS_CLASS[status] || STATUS_CLASS.healthy;

  return (
    <span
      className={`status-badge ${statusClass} ${className}`.trim()}
      role="status"
      aria-label={`Status: ${text}`}
    >
      {showDot && <span className="status-badge__dot" aria-hidden="true" />}
      <span className="status-badge__text">{text}</span>
    </span>
  );
}