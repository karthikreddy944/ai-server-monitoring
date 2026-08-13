/**
 * Shared metric status logic for the dashboard.
 * Thresholds are consistent across cards, overview rows, and system status.
 */

export const STATUS = {
    HEALTHY: "healthy",
    WARNING: "warning",
    CRITICAL: "critical",
  };
  
  export function getStatusFromValue(value) {
    if (value >= 90) return STATUS.CRITICAL;
    if (value >= 70) return STATUS.WARNING;
    return STATUS.HEALTHY;
  }
  
  export function getStatusLabel(status) {
    switch (status) {
      case STATUS.CRITICAL:
        return "Critical";
      case STATUS.WARNING:
        return "Warning";
      default:
        return "Healthy";
    }
  }
  
  export function getOverallStatus(metrics) {
    const values = [metrics.cpu.value, metrics.ram.value, metrics.disk.value];
    const highest = Math.max(...values);
    return getStatusFromValue(highest);
  }
  
  export function getOverallMessage(status) {
    switch (status) {
      case STATUS.CRITICAL:
        return "One or more resources are at critical utilization.";
      case STATUS.WARNING:
        return "One or more resources are approaching high utilization.";
      default:
        return "All monitored services are responding normally.";
    }
  }

  export function getDetailedStatusMessage(metrics) {
    const resources = [
      { key: "CPU", value: metrics.cpu.value, noun: "Processor" },
      { key: "RAM", value: metrics.ram.value, noun: "Memory" },
      { key: "Disk", value: metrics.disk.value, noun: "Disk storage" },
    ];
    const ranked = resources
      .map((r) => ({ ...r, status: getStatusFromValue(r.value) }))
      .sort((a, b) => b.value - a.value);
    const critical = ranked.filter((r) => r.status === STATUS.CRITICAL);
    const warning = ranked.filter((r) => r.status === STATUS.WARNING);
    if (critical.length === 1) return `${critical[0].noun} utilization is critically high.`;
    if (critical.length > 1) return `${critical.map((r) => r.noun.toLowerCase()).join(", ")} are critically high.`;
    if (warning.length === 1) return `${warning[0].noun} utilization is elevated.`;
    if (warning.length > 1) return `${warning.map((r) => r.key).join(", ")} utilization is elevated.`;
    return "All monitored resources are within normal operating range.";
  }