export default function Analytics() {
    return (
      <div className="page">
        <header className="page-head"><h1>Analytics</h1><p>Historical performance trends</p></header>
        <section className="info-panel">
          <h2>Historical analytics not connected yet</h2>
          <p>Will connect when the historical metrics API is implemented (Day 4 / SQLite).</p>
          <ul><li>CPU over time</li><li>RAM trends</li><li>Disk history</li></ul>
          <p className="muted italic">No historical data is shown — backend does not expose it yet.</p>
        </section>
      </div>
    );
  }