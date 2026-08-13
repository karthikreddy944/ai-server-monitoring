import { getStatusFromValue } from "../utils/metricsStatus";

export default function Sparkline({ data = [], width = 120, height = 32 }) {
  const pad = 2;
  if (data.length < 2) {
    return (
      <svg className="sparkline sparkline--empty" width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />
      </svg>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const status = getStatusFromValue(data[data.length - 1]);
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className={`sparkline sparkline--${status}`} width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}