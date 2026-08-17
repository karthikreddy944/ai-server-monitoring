from datetime import datetime, timezone
from statistics import mean

from app.db.database import fetch_metrics_history
from app.schemas.trends import TrendResult, TrendsResponse

MINIMUM_SAMPLES = 10
TREND_THRESHOLD = 5.0  # percentage points

METRIC_FIELDS = ("cpu", "ram", "disk")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _numeric_values(history: list[dict], field: str) -> list[float]:
    return [row[field] for row in history if isinstance(row.get(field), (int, float))]


def _compute_trend(values: list[float]) -> TrendResult:
    """
    Split the retrieved window into an earlier half and a later half
    (history from fetch_metrics_history() is already oldest-to-newest),
    compare their averages, and classify the direction. No ML, no
    forecasting - a plain comparison of two real averages.
    """
    if len(values) < MINIMUM_SAMPLES:
        return TrendResult(
            direction="insufficient_data",
            change_percent=None,
            current=round(values[-1], 2) if values else None,
            average=round(mean(values), 2) if values else None,
        )

    midpoint = len(values) // 2
    first_half = values[:midpoint]
    second_half = values[midpoint:]

    avg_first = mean(first_half)
    avg_second = mean(second_half)
    change = avg_second - avg_first

    if change >= TREND_THRESHOLD:
        direction = "increasing"
    elif change <= -TREND_THRESHOLD:
        direction = "decreasing"
    else:
        direction = "stable"

    return TrendResult(
        direction=direction,
        change_percent=round(change, 2),
        current=round(values[-1], 2),
        average=round(mean(values), 2),
    )


def build_trends(limit: int = 100) -> TrendsResponse:
    """
    Analyze real stored metrics history and report, per metric,
    whether it's increasing/decreasing/stable, or insufficient_data
    if there aren't yet enough samples for a meaningful comparison.
    """
    history = fetch_metrics_history(limit=limit)
    sample_count = len(history)

    trends: dict[str, TrendResult] = {}
    for field in METRIC_FIELDS:
        values = _numeric_values(history, field)
        trends[field] = _compute_trend(values)

    return TrendsResponse(
        trends=trends,
        sample_count=sample_count,
        generated_at=_now(),
    )
