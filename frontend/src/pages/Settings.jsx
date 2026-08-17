import { useMetricsContext } from "../context/MetricsContext";
import "./Settings.css";

function StatusDot({ tone = "ok" }) {
  return <span className={`settings-status-dot settings-status-dot--${tone}`} aria-hidden="true" />;
}

function InfoRow({ label, value, hint, status }) {
  return (
    <div className="settings-info-row">
      <div>
        <div className="settings-info-label">{label}</div>
        {hint && <div className="settings-info-hint">{hint}</div>}
      </div>
      <div className="settings-info-value">
        {status && <StatusDot tone={status} />}
        <span>{value}</span>
      </div>
    </div>
  );
}

function SettingsCard({ eyebrow, title, description, children }) {
  return (
    <section className="settings-card">
      <div className="settings-card-head">
        <div>
          <div className="settings-eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="settings-card-body">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { metrics, loading, error } = useMetricsContext();

  const connectionStatus = loading
    ? "Connecting"
    : error && !metrics
      ? "Disconnected"
      : error
        ? "Connected · stale data"
        : "Connected";

  const connectionTone = connectionStatus === "Connected" ? "ok" : "warn";
  const instance = metrics?.cpu?.instance || metrics?.ram?.instance || "Unknown instance";

  return (
    <div className="page settings-page">
      <header className="settings-header">
        <div>
          <div className="settings-eyebrow">SYSTEM CONFIGURATION</div>
          <h1>Settings</h1>
          <p>Monitor the configuration and health of your AI-powered laptop monitoring stack.</p>
        </div>
        <div className={`settings-connection-badge settings-connection-badge--${connectionTone}`}>
          <StatusDot tone={connectionTone} />
          <span>{connectionStatus}</span>
        </div>
      </header>

      <div className="settings-grid">
        <SettingsCard
          eyebrow="MONITORING"
          title="Collection & telemetry"
          description="Live system metrics and the source currently being monitored."
        >
          <InfoRow
            label="Monitoring instance"
            hint="Prometheus target label"
            value={instance}
          />
          <InfoRow
            label="Metric refresh"
            hint="Frontend live metrics polling"
            value="3 seconds"
          />
          <InfoRow
            label="Tracked resources"
            hint="Primary observability signals"
            value="CPU · RAM · Disk"
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="AI ENGINE"
          title="Local intelligence"
          description="Configuration used by the on-demand and automatic AI explanations."
        >
          <InfoRow
            label="Model"
            hint="Local Ollama model"
            value="Qwen 2.5 · 3B"
          />
          <InfoRow
            label="AI mode"
            hint="Triggered by meaningful risk changes"
            value="Automatic + manual"
            status="ok"
          />
          <InfoRow
            label="Explanation cooldown"
            hint="Per-metric protection against repeated calls"
            value="90 seconds"
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="RISK FORECAST"
          title="Threshold monitoring"
          description="Deterministic forecasting remains the source of truth for risk calculations."
        >
          <InfoRow
            label="Critical threshold"
            hint="CPU · RAM · Disk"
            value="90%"
          />
          <InfoRow
            label="Forecasting"
            hint="Estimated time to threshold when trend is usable"
            value="Enabled"
            status="ok"
          />
          <InfoRow
            label="AI responsibility"
            hint="Narrative and recommendations only"
            value="Explain · Recommend"
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="CONNECTION"
          title="Backend services"
          description="Current application connectivity and local AI service architecture."
        >
          <InfoRow
            label="FastAPI backend"
            hint="Metrics and risk API"
            value="localhost:8000"
            status={connectionTone}
          />
          <InfoRow
            label="Ollama"
            hint="Local LLM inference service"
            value="localhost:11434"
          />
          <InfoRow
            label="Data source"
            hint="Windows metrics pipeline"
            value="Prometheus"
          />
        </SettingsCard>
      </div>

      <div className="settings-note">
        <div className="settings-note-icon">i</div>
        <div>
          <strong>Read-only configuration</strong>
          <p>These values reflect the current application configuration. Runtime settings are managed by the backend and local services.</p>
        </div>
      </div>
    </div>
  );
}
