import { useState } from "react";

const TABS = ["CPU", "RAM", "Disk"];

export default function ResourceUsage() {
  const [tab, setTab] = useState("CPU");
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
        {TABS.map((t) => (
          <button key={t} type="button" className={`resource-usage__tab${tab === t ? " resource-usage__tab--active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="resource-usage__chart">
        <div className="resource-usage__grid" aria-hidden="true" />
        <div className="resource-usage__empty">
          <p><strong>{tab} history</strong></p>
          <p>Historical metrics are not available yet. This chart is ready for the Day 4 SQLite API.</p>
          <p className="resource-usage__note">Current {tab} values above update in real time from the API.</p>
        </div>
      </div>
      <p className="resource-usage__foot">Metrics refresh automatically every 1 second.</p>
    </section>
  );
}