import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MetricsProvider } from "../context/MetricsContext";
import "../pages/Dashboard.css";
import "../pages/Pages.css";

export default function AppLayout() {
  return (
    <MetricsProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main"><Outlet /></div>
      </div>
    </MetricsProvider>
  );
}