function IconDashboard() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.75" />
        <rect x="13" y="3" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.75" />
        <rect x="13" y="10" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.75" />
        <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }
  function IconActivity() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h3l2-7 4 14 2-7h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  function IconChart() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19V5M4 19h16M8 15V11M12 15V8M16 15v-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  function IconSpark() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    );
  }
  function IconSettings() {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  
  export const NAV_ITEMS = [
    { path: "/", label: "Dashboard", icon: IconDashboard, end: true },
    { path: "/monitoring", label: "Monitoring", icon: IconActivity },
    { path: "/analytics", label: "Analytics", icon: IconChart },
    { path: "/ai-insights", label: "AI Insights", icon: IconSpark },
    { path: "/settings", label: "Settings", icon: IconSettings },
  ];