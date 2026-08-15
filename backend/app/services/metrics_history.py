from app.db.database import fetch_metrics_history, insert_metrics_record
from app.schemas.metrics import MetricsSummary


def save_metrics_snapshot(summary: MetricsSummary) -> None:
    """Persist a successful real metrics snapshot to SQLite."""
    insert_metrics_record(
        cpu=summary.cpu.value,
        ram=summary.ram.value,
        disk=summary.disk.value,
        instance=summary.cpu.instance,
    )


def get_metrics_history(limit: int = 100) -> list[dict]:
    """Read historical records from SQLite."""
    return fetch_metrics_history(limit=limit)