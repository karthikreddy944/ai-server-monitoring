import { useMetricsContext } from "../context/MetricsContext";

export default function Settings() {
  const { metrics, loading, error } = useMetricsContext();
  const status = loading ? "Connecting…" : error && !metrics ? "Disconnected" : error ? "Connected (stale)" : "Connected";
  const instance = metrics?.cpu?.instance ?? "—";

  return (
    <div className="page">
      <header className="page-head"><h1>Settings</h1><p>Monitoring configuration</p></header>
      <section className="settings">
        <div className="settings__row"><span>Monitoring refresh interval</span><strong>1 second</strong></div>
        <div className="settings__row"><span>Current monitoring instance</span><strong>{instance}</strong></div>
        <div className="settings__row"><span>Connection status</span><strong className={status === "Connected" ? "ok" : "warn"}>{status}</strong></div>
      </section>
    </div>
  );
}