import { createContext, useContext } from "react";
import { useMetrics } from "../hooks/useMetrics";

const MetricsContext = createContext(null);

export function MetricsProvider({ children }) {
  const value = useMetrics();
  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
}

export function useMetricsContext() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error("useMetricsContext must be used within MetricsProvider");
  return ctx;
}