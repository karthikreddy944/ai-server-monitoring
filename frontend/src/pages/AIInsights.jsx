import { useInsights } from "../hooks/useInsights";

// Same accent colors ResourceUsage.jsx already uses for CPU/RAM/Disk,
// so this page reads as part of the same product instead of a bolt-on.
const SEVERITY_META = {
  critical: { icon: "\u{1F534}", label: "Critical", color: "#ef4444" },
  warning: { icon: "\u{1F7E0}", label: "Warning", color: "#f59e0b" },
  info: { icon: "\u{1F7E2}", label: "Normal", color: "#22c55e" },
  insufficient_data: { icon: "\u26AA", label: "Insufficient Data", color: "#94a3b8" },
};

function InsightCard({ insight }) {
  const meta = SEVERITY_META[insight.severity] || SEVERITY_META.info;
  return (
    <div className="insight-card" style={{ borderLeftColor: meta.color }}>
      <div className="insight-card__head">
        <span className="insight-card__icon" aria-hidden="true">{meta.icon}</span>
        <h3 className="insight-card__title">{insight.title}</h3>
      </div>
      <p className="insight-card__message">{insight.message}</p>
      <p className="insight-card__suggestion">
        <strong>Suggestion:</strong> {insight.suggestion}
      </p>
    </div>
  );
}

export default function AIInsights() {
  const { insights, sampleCount, loading, error } = useInsights(100, 5000);
  const hasInsights = insights.length > 0;

  return (
    <div className="page">
      <header className="page-head">
        <h1>AI Insights</h1>
        <p>Rule-based analysis of your real system metrics</p>
      </header>

      {loading && !hasInsights && (
        <>
          <div className="skeleton sk-panel" />
          <div className="skeleton sk-panel" />
        </>
      )}

      {!loading && error && !hasInsights && (
        <section className="page-error">
          <h2>Unable to load insights</h2>
          <p className="page-error__detail">{error}</p>
        </section>
      )}

      {hasInsights && (
        <>
          <div className="insights-list">
            {insights.map((insight, i) => (
              <InsightCard key={`${insight.metric}-${insight.title}-${i}`} insight={insight} />
            ))}
          </div>
          <p className="resource-usage__foot">
            Based on {sampleCount} stored sample{sampleCount === 1 ? "" : "s"}. Updates automatically every 5 seconds.
          </p>
        </>
      )}

      <style>{`
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 20px;
        }
        .insight-card {
          background: #11161f;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left-width: 3px;
          border-radius: 10px;
          padding: 16px 18px;
        }
        .insight-card__head {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .insight-card__icon {
          font-size: 1.1rem;
          line-height: 1;
        }
        .insight-card__title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
        }
        .insight-card__message {
          margin: 8px 0 0;
          font-size: 0.875rem;
          opacity: 0.85;
          line-height: 1.5;
        }
        .insight-card__suggestion {
          margin: 8px 0 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
