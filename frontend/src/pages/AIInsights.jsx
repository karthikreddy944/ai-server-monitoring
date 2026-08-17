import { useState } from "react";
import { useInsights } from "../hooks/useInsights";
import { useExplainInsight } from "../hooks/useExplainInsight";

// Same accent colors ResourceUsage.jsx already uses for CPU/RAM/Disk,
// so this page reads as part of the same product instead of a bolt-on.
const SEVERITY_META = {
  critical: { icon: "\u{1F534}", label: "Critical", color: "#ef4444" },
  warning: { icon: "\u{1F7E0}", label: "Warning", color: "#f59e0b" },
  info: { icon: "\u{1F7E2}", label: "Normal", color: "#22c55e" },
  insufficient_data: { icon: "\u26AA", label: "Insufficient Data", color: "#94a3b8" },
};

// Metric selector options for the on-demand AI Explanation section.
// value=null means "overall" -> POST /api/insights/explain with no body.
const EXPLAIN_METRICS = [
  { label: "Overall", value: null, hex: "#3b82f6" },
  { label: "CPU", value: "cpu", hex: "#22c55e" },
  { label: "RAM", value: "ram", hex: "#ef4444" },
  { label: "Disk", value: "disk", hex: "#f59e0b" },
];

const SOURCE_META = {
  llm: { label: "AI-generated", color: "#22c55e" },
  fallback: { label: "System fallback", color: "#94a3b8" },
};

function formatGeneratedAt(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AIExplanationSection() {
  const [selected, setSelected] = useState(EXPLAIN_METRICS[0]);
  const { result, loading, error, explain } = useExplainInsight();

  const sourceMeta = result ? SOURCE_META[result.source] || SOURCE_META.fallback : null;

  return (
    <section className="ai-explain">
      <div className="ai-explain__head">
        <div>
          <h2>AI Explanation</h2>
          <p>On-demand, LLM-generated analysis of current conditions</p>
        </div>
      </div>

      <div className="ai-explain__tabs">
        {EXPLAIN_METRICS.map((m) => {
          const isActive = selected.label === m.label;
          return (
            <button
              key={m.label}
              type="button"
              className={`ai-explain__tab${isActive ? " ai-explain__tab--active" : ""}`}
              onClick={() => setSelected(m)}
              disabled={loading}
              style={
                isActive
                  ? { background: `${m.hex}1f`, borderColor: `${m.hex}55`, color: m.hex }
                  : undefined
              }
            >
              <span className="ai-explain__tab-dot" style={{ background: m.hex }} />
              {m.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="ai-explain__generate"
        onClick={() => explain(selected.value)}
        disabled={loading}
      >
        {loading ? "Generating…" : "Generate AI Explanation"}
      </button>

      {loading && (
        <p className="ai-explain__status">AI is analyzing current system conditions...</p>
      )}

      {!loading && error && (
        <div className="ai-explain__error">
          <p><strong>Unable to generate explanation</strong></p>
          <p className="ai-explain__note">{error}</p>
        </div>
      )}

      {!loading && !error && result && (
        <div className="ai-explain__result">
          <div className="ai-explain__result-head">
            <h3>{result.title}</h3>
            {sourceMeta && (
              <span className="ai-explain__badge" style={{ color: sourceMeta.color, borderColor: `${sourceMeta.color}55` }}>
                {sourceMeta.label}
              </span>
            )}
          </div>
          <p className="ai-explain__explanation">{result.explanation}</p>
          {result.recommendation && (
            <p className="ai-explain__recommendation">
              <strong>Recommendation:</strong> {result.recommendation}
            </p>
          )}
          {result.generated_at && (
            <p className="ai-explain__timestamp">Generated {formatGeneratedAt(result.generated_at)}</p>
          )}
        </div>
      )}

      <style>{`
        .ai-explain {
          margin-top: 28px;
          background: #151b24;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1.25rem;
        }
        .ai-explain__head h2 {
          margin: 0;
          font-size: 1rem;
        }
        .ai-explain__head p {
          margin: .25rem 0 0;
          font-size: .8125rem;
          color: var(--color-muted);
        }
        .ai-explain__tabs {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .ai-explain__tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: .8125rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          background: transparent;
          color: var(--color-text);
          cursor: pointer;
        }
        .ai-explain__tab:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .ai-explain__tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .ai-explain__generate {
          margin-top: 14px;
          padding: .5rem 1rem;
          border: 1px solid rgba(59,130,246,.4);
          border-radius: 4px;
          background: rgba(59,130,246,.12);
          color: #93c5fd;
          font-size: .8125rem;
          cursor: pointer;
        }
        .ai-explain__generate:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .ai-explain__status {
          margin: 12px 0 0;
          font-size: .8125rem;
          color: var(--color-muted);
        }
        .ai-explain__error {
          margin-top: 12px;
        }
        .ai-explain__error p {
          margin: 0;
          font-size: .8125rem;
        }
        .ai-explain__note {
          margin-top: 4px !important;
          color: var(--color-muted);
        }
        .ai-explain__result {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ai-explain__result-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .ai-explain__result-head h3 {
          margin: 0;
          font-size: .95rem;
          font-weight: 600;
        }
        .ai-explain__badge {
          font-size: .6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .04em;
          border: 1px solid;
          border-radius: 999px;
          padding: 2px 10px;
          white-space: nowrap;
        }
        .ai-explain__explanation {
          margin: 10px 0 0;
          font-size: .875rem;
          line-height: 1.5;
          opacity: 0.85;
        }
        .ai-explain__recommendation {
          margin: 8px 0 0;
          font-size: .875rem;
          line-height: 1.5;
        }
        .ai-explain__timestamp {
          margin: 10px 0 0;
          font-size: .75rem;
          color: var(--color-muted);
        }
      `}</style>
    </section>
  );
}

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

      <AIExplanationSection />

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
