import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import settings


def get_connection() -> sqlite3.Connection:
    """Open SQLite connection and ensure the data folder exists."""
    db_path = Path(settings.database_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    """Create the metrics_history table if it does not exist."""
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                cpu REAL NOT NULL,
                ram REAL NOT NULL,
                disk REAL NOT NULL,
                instance TEXT NOT NULL
            )
            """
        )
        connection.commit()


def insert_metrics_record(
    cpu: float,
    ram: float,
    disk: float,
    instance: str,
) -> None:
    """Insert one real metrics snapshot."""
    timestamp = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO metrics_history (timestamp, cpu, ram, disk, instance)
            VALUES (?, ?, ?, ?, ?)
            """,
            (timestamp, cpu, ram, disk, instance),
        )
        connection.commit()


def fetch_metrics_history(limit: int = 100) -> list[dict]:
    """
    Return the latest `limit` records in chronological order (oldest first).
    """
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, timestamp, cpu, ram, disk, instance
            FROM metrics_history
            WHERE id IN (
                SELECT id
                FROM metrics_history
                ORDER BY id DESC
                LIMIT ?
            )
            ORDER BY id ASC
            """,
            (limit,),
        ).fetchall()

    return [dict(row) for row in rows]