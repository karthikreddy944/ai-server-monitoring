import StatusBadge from "./StatusBadge";
import { getDetailedStatusMessage, getStatusLabel } from "../utils/metricsStatus";

export default function SystemStatus({ status, metrics }) {
  return (
    <section className={`system-status system-status--${status}`}>
      <div className="system-status__left">
        <p className="system-status__label">SYSTEM STATUS</p>
        <StatusBadge status={status} label={getStatusLabel(status).toUpperCase()} />
      </div>
      <p className="system-status__msg">{getDetailedStatusMessage(metrics)}</p>
    </section>
  );
}