import { useEffect, useMemo, useRef, useState } from "react";

const TABS = ["CPU", "RAM", "Disk"];
const FIELD_BY_TAB = { CPU: "cpu", RAM: "ram", Disk: "disk" };

// Per-metric accent so the chart visually matches the metric card colors
// (CPU=healthy green, RAM=critical red, Disk=warning amber) instead of
// always rendering blue regardless of which tab is active.
const ACCENTS = {
  CPU: { hex: "#22c55e", rgb: "34, 197, 94" },
  RAM: { hex: "#ef4444", rgb: "239, 68, 68" },
  Disk: { hex: "#f59e0b", rgb: "245, 158, 11" },
};

const CHART_WIDTH = 640;
const PLOT_HEIGHT = 180;
const AXIS_HEIGHT = 28;
const TOTAL_HEIGHT = PLOT_HEIGHT + AXIS_HEIGHT;

const PAD_TOP = 14;
const PAD_BOTTOM = 22;
const PAD_LEFT = 40;
const PAD_RIGHT = 20;

const Y_TICKS = [0, 25, 50, 75, 100];

function formatAxisTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatTooltipDateTime(ts) {
  const d = new Date(ts);
  const datePart = d.toLocaleDateString([], { month: "short", day: "numeric" });
  const timePart = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  return `${datePart}, ${timePart}`;
}

function buildPoints(records, field) {
  return records
    .filter((r) => typeof r[field] === "number")
    .map((r) => ({ value: r[field], timestamp: r.timestamp }));
}

function toSvgCoords(points) {
  const usableWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const usableHeight = PLOT_HEIGHT - PAD_TOP - PAD_BOTTOM;
  if (points.length === 0) return [];
  if (points.length === 1) {
    const y = PAD_TOP + usableHeight - (points[0].value / 100) * usableHeight;
    return [{ x: PAD_LEFT, y, ...points[0] }];
  }
  const step = usableWidth / (points.length - 1);
  return points.map((p, i) => ({
    x: PAD_LEFT + i * step,
    y: PAD_TOP + usableHeight - (p.value / 100) * usableHeight,
    ...p,
  }));
}

function yForPercent(pct) {
  const usableHeight = PLOT_HEIGHT - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + usableHeight - (pct / 100) * usableHeight;
}

// Smooth Catmull-Rom -> Bezier curve through the real points (visual smoothing only,
// the underlying values plotted are unchanged).
function buildSmoothLinePath(coords) {
  if (coords.length === 0) return "";
  if (coords.length === 1) return `M${coords[0].x},${coords[0].y} L${coords[0].x},${coords[0].y}`;
  if (coords.length === 2) {
    return `M${coords[0].x},${coords[0].y} L${coords[1].x},${coords[1].y}`;
  }
  let d = `M${coords[0].x.toFixed(2)},${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] || coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

function buildAreaPath(coords) {
  if (coords.length === 0) return "";
  const baseline = PLOT_HEIGHT - PAD_BOTTOM;
  const line = buildSmoothLinePath(coords);
  const last = coords[coords.length - 1];
  const first = coords[0];
  return `${line} L${last.x.toFixed(2)},${baseline} L${first.x.toFixed(2)},${baseline} Z`;
}

// Picks up to maxLabels evenly spaced indices from real data points.
// Never invents timestamps - only selects from indices that already exist.
function pickLabelIndices(length, maxLabels) {
  if (length === 0) return [];
  if (length <= maxLabels) return Array.from({ length }, (_, i) => i);
  const step = (length - 1) / (maxLabels - 1);
  const indices = [];
  for (let i = 0; i < maxLabels; i++) {
    indices.push(Math.round(i * step));
  }
  return [...new Set(indices)];
}

function anchorForIndex(i, total) {
  if (i === 0) return "start";
  if (i === total - 1) return "end";
  return "middle";
}

export default function ResourceUsage({ history = [], loading = false, error = null }) {
  const [tab, setTab] = useState("CPU");
  const [hoverIndex, setHoverIndex] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [containerWidth, setContainerWidth] = useState(CHART_WIDTH);
  const chartRef = useRef(null);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [history]
  );

  const field = FIELD_BY_TAB[tab];
  const accent = ACCENTS[tab];
  const points = useMemo(() => buildPoints(sortedHistory, field), [sortedHistory, field]);
  const coords = useMemo(() => toSvgCoords(points), [points]);
  const linePath = useMemo(() => buildSmoothLinePath(coords), [coords]);
  const areaPath = useMemo(() => buildAreaPath(coords), [coords]);

  const latest = points.length > 0 ? points[points.length - 1] : null;
  const latestCoord = coords.length > 0 ? coords[coords.length - 1] : null;
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;

  useEffect(() => {
    if (!chartRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const maxLabels =
    containerWidth < 360 ? 3 : containerWidth < 500 ? 4 : containerWidth < 620 ? 5 : 6;

  const labelIndices = useMemo(
    () => pickLabelIndices(coords.length, maxLabels),
    [coords.length, maxLabels]
  );

  useEffect(() => {
    setAnimKey((k) => k + 1);
    setHoverIndex(null);
  }, [tab, points.length]);

  return (
    <section className="resource-usage">
      <div className="resource-usage__head">
        <div>
          <h2>Resource Usage</h2>
          <p>Historical trend visualization</p>
        </div>
        <span className="resource-usage__tag">Live</span>
      </div>

      <div className="resource-usage__tabs">
        {TABS.map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              className={`resource-usage__tab${isActive ? " resource-usage__tab--active" : ""}`}
              onClick={() => setTab(t)}
              style={
                isActive
                  ? {
                      background: `${ACCENTS[t].hex}1f`,
                      borderColor: `${ACCENTS[t].hex}55`,
                      color: ACCENTS[t].hex,
                    }
                  : undefined
              }
            >
              <span className="resource-usage__tab-dot" style={{ background: ACCENTS[t].hex }} />
              {t}
            </button>
          );
        })}
      </div>

      <div
        className="resource-usage__chart"
        ref={chartRef}
        style={{ "--ru-accent": accent.hex, "--ru-glow-rgb": accent.rgb }}
      >
        {loading && (
          <div className="resource-usage__empty resource-usage__empty--fade">
            <p><strong>Loading {tab} history…</strong></p>
          </div>
        )}

        {!loading && error && (
          <div className="resource-usage__empty resource-usage__empty--fade">
            <p><strong>Unable to load {tab} history</strong></p>
            <p className="resource-usage__note">{error}</p>
          </div>
        )}

        {!loading && !error && points.length === 0 && (
          <div className="resource-usage__empty resource-usage__empty--fade">
            <p><strong>No historical data available</strong></p>
            <p className="resource-usage__note">Current {tab} values above update in real time from the API.</p>
          </div>
        )}

        {!loading && !error && points.length > 0 && (
          <svg
            key={animKey}
            viewBox={`0 0 ${CHART_WIDTH} ${TOTAL_HEIGHT}`}
            preserveAspectRatio="none"
            className="ru-svg"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="ru-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ru-accent)" stopOpacity="0.34" />
                <stop offset="55%" stopColor="var(--ru-accent)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="var(--ru-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {Y_TICKS.map((pct) => (
              <g key={pct}>
                <line
                  x1={PAD_LEFT}
                  x2={CHART_WIDTH - PAD_RIGHT}
                  y1={yForPercent(pct)}
                  y2={yForPercent(pct)}
                  className="ru-gridline"
                />
                <text x={PAD_LEFT - 8} y={yForPercent(pct) + 3} textAnchor="end" className="ru-y-label">
                  {pct}%
                </text>
              </g>
            ))}

            {hovered && (
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={PAD_TOP}
                y2={PLOT_HEIGHT - PAD_BOTTOM}
                className="ru-hover-guide"
              />
            )}

            <path d={areaPath} className="ru-area" fill="url(#ru-area-fill)" />
            <path d={linePath} className="ru-line" fill="none" />

            {coords.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={hoverIndex === i ? 5 : 3}
                className="ru-point"
                onMouseEnter={() => setHoverIndex(i)}
              />
            ))}

            {latestCoord && (
              <g className="ru-latest">
                <circle cx={latestCoord.x} cy={latestCoord.y} r="6" className="ru-latest__pulse ru-latest__pulse--a" />
                <circle cx={latestCoord.x} cy={latestCoord.y} r="6" className="ru-latest__pulse ru-latest__pulse--b" />
                <circle cx={latestCoord.x} cy={latestCoord.y} r="5" className="ru-latest__halo" />
                <circle cx={latestCoord.x} cy={latestCoord.y} r="3.5" className="ru-latest__dot" />
              </g>
            )}

            <line
              x1={PAD_LEFT}
              x2={CHART_WIDTH - PAD_RIGHT}
              y1={PLOT_HEIGHT - PAD_BOTTOM}
              y2={PLOT_HEIGHT - PAD_BOTTOM}
              className="ru-axis-line"
            />

            {labelIndices.map((i) => {
              const c = coords[i];
              if (!c) return null;
              return (
                <g key={i}>
                  <line
                    x1={c.x}
                    x2={c.x}
                    y1={PLOT_HEIGHT - PAD_BOTTOM}
                    y2={PLOT_HEIGHT - PAD_BOTTOM + 5}
                    className="ru-axis-tick"
                  />
                  <text
                    x={c.x}
                    y={PLOT_HEIGHT - PAD_BOTTOM + 19}
                    textAnchor={anchorForIndex(i, coords.length)}
                    className="ru-axis-label"
                  >
                    {formatAxisTime(c.timestamp)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {hovered && (
          <div
            className={`ru-tooltip${hovered.y < 45 ? " ru-tooltip--below" : ""}`}
            style={{
              left: `${(hovered.x / CHART_WIDTH) * 100}%`,
              top: `${(hovered.y / TOTAL_HEIGHT) * 100}%`,
            }}
          >
            <div className="ru-tooltip__metric">{tab}</div>
            <div className="ru-tooltip__value">{hovered.value.toFixed(2)}%</div>
            <div className="ru-tooltip__time">{formatTooltipDateTime(hovered.timestamp)}</div>
          </div>
        )}
      </div>

      {!loading && !error && points.length > 0 && (
        <div className="resource-usage__summary">
          <span className="resource-usage__summary-metric">{tab}</span>
          <span className="resource-usage__summary-value">{latest.value.toFixed(2)}%</span>
          <span className="resource-usage__summary-count">{points.length} sample{points.length === 1 ? "" : "s"}</span>
        </div>
      )}

      <p className="resource-usage__foot">Metrics refresh automatically every 1 second.</p>
    </section>
  );
}