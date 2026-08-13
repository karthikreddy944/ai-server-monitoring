import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../config/navItems";
import { useMetricsContext } from "../context/MetricsContext";

export default function Sidebar() {
  const { metrics, error } = useMetricsContext();
  const connected = Boolean(metrics && !error);

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <p className="sidebar__eyebrow">AI MONITOR</p>
      </div>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
          <NavLink key={path} to={path} end={end} className={({ isActive }) => `sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`}>
            <Icon /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        <span className={`sidebar__live-dot ${connected ? "sidebar__live-dot--on" : ""}`} />
        <div>
          <p className="sidebar__live-label">LIVE MONITORING</p>
          <p className="sidebar__live-status">{connected ? "Connected" : error ? "Connection issue" : "Connecting…"}</p>
        </div>
      </div>
    </aside>
  );
}