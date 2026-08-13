function formatUpdated(date) {
    if (!date) return "—";
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 2) return "just now";
    if (s === 1) return "1 second ago";
    if (s < 60) return `${s} seconds ago`;
    const m = Math.floor(s / 60);
    return m === 1 ? "1 minute ago" : `${m} minutes ago`;
  }
  
  export default function TopBar({ lastUpdated, isLive }) {
    return (
      <header className="top-bar">
        <div>
          <h1 className="top-bar__title">Laptop Performance</h1>
          <p className="top-bar__subtitle">Live resource utilization and system health</p>
        </div>
        <div className="top-bar__right">
          <div className={`top-bar__live ${isLive ? "top-bar__live--on" : ""}`}>
            <span className="top-bar__live-dot" /> LIVE
          </div>
          <p className="top-bar__updated">Updated {formatUpdated(lastUpdated)}</p>
        </div>
      </header>
    );
  }