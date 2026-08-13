import { useEffect, useState } from "react";

const MAX = 24;

export function useMetricSamples(metrics) {
  const [samples, setSamples] = useState({ cpu: [], ram: [], disk: [] });

  useEffect(() => {
    if (!metrics) return;
    setSamples((prev) => ({
      cpu: [...prev.cpu, metrics.cpu.value].slice(-MAX),
      ram: [...prev.ram, metrics.ram.value].slice(-MAX),
      disk: [...prev.disk, metrics.disk.value].slice(-MAX),
    }));
  }, [metrics]);

  return samples;
}