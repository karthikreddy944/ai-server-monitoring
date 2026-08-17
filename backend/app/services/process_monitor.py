import time

import psutil

from app.schemas.processes import ProcessInfo

# psutil's per-process cpu_percent() needs two samples separated by a
# time interval to report a meaningful (non-zero) value - the first
# call after a process object is created always returns 0.0. We prime
# every process once, wait briefly, then read the real values.
CPU_SAMPLE_INTERVAL_SECONDS = 0.5

BYTES_PER_MB = 1024 * 1024

# Not real applications - these are OS pseudo-processes representing
# unused CPU time. "System Idle Process" (Windows) can legitimately
# report CPU usage in the thousands of percent (sum of idle time
# across all logical cores), which would be misleading shown as an
# app. Excluded from results entirely, not just top_cpu, since they
# have no meaningful application-level footprint either way.
EXCLUDED_PROCESS_NAMES = {"system idle process", "idle"}


def _prime_cpu_percent() -> None:
    """First pass: start CPU measurement for every readable process."""
    for proc in psutil.process_iter():
        try:
            proc.cpu_percent(None)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue


def get_top_processes(limit: int = 5) -> tuple[list[ProcessInfo], list[ProcessInfo], int]:
    """
    Take one real snapshot of running processes via psutil and return
    the top `limit` by CPU percent and top `limit` by memory percent.

    Returns (top_cpu, top_memory, real_process_count).
    Never invents data - processes that can't be read (permission
    errors, exited mid-scan) are simply skipped, not faked. OS
    pseudo-processes (e.g. "System Idle Process") are excluded as
    they don't represent real applications; real_process_count
    reflects the count AFTER that exclusion.
    """
    _prime_cpu_percent()
    time.sleep(CPU_SAMPLE_INTERVAL_SECONDS)

    readings: list[ProcessInfo] = []

    for proc in psutil.process_iter(["pid", "name", "memory_percent", "memory_info"]):
        try:
            cpu = proc.cpu_percent(None)
            info = proc.info
            name = info["name"] or "unknown"

            if name.strip().lower() in EXCLUDED_PROCESS_NAMES:
                continue

            memory_info = info.get("memory_info")
            memory_mb = (memory_info.rss / BYTES_PER_MB) if memory_info else 0.0

            readings.append(
                ProcessInfo(
                    pid=info["pid"],
                    name=name,
                    cpu_percent=round(cpu, 2),
                    memory_percent=round(info.get("memory_percent") or 0.0, 2),
                    memory_mb=round(memory_mb, 2),
                )
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    top_cpu = sorted(readings, key=lambda p: p.cpu_percent, reverse=True)[:limit]
    top_memory = sorted(readings, key=lambda p: p.memory_percent, reverse=True)[:limit]

    return top_cpu, top_memory, len(readings)
