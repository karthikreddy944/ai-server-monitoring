from datetime import datetime, timezone
from statistics import mean

from app.db.database import fetch_metrics_history
from app.schemas.insights import Insight, InsightsResponse

# Same cutoffs as frontend/src/utils/metricsStatus.js - keep both in sync.
CRITICAL_THRESHOLD = 90.0
WARNING_THRESHOLD = 70.0

# How many of the most recent samples count as "sustained" for a
# high-usage insight. Below this many samples we don't have enough
# recent history to call something "sustained".
SUSTAINED_WINDOW = 5

# A jump of this many percentage points between consecutive samples
# counts as a spike.
SPIKE_DELTA_THRESHOLD = 20.0

# We refuse to draw ANY conclusion - including "normal" - with fewer
# than this many total stored samples. This is deliberate: an empty
# or near-empty history must never be reported as "system healthy".
MIN_SAMPLES_FOR_ANALYSIS = 5

METRIC_LABELS = {"cpu": "CPU", "ram": "RAM", "disk": "Disk"}

SUGGESTIONS = {
    "cpu": {
        "critical": "Check CPU-heavy processes and close or throttle anything unnecessary.",
        "warning": "Monitor CPU-intensive processes; consider closing background tasks.",
        "spike": "Check recently started or CPU-intensive processes.",
    },
    "ram": {
        "critical": "Close unused applications or investigate memory-heavy processes.",
        "warning": "Consider closing unused applications to free up memory.",
        "spike": "Check for recently launched memory-heavy applications.",
    },
    "disk": {
        "critical": "Free up disk space by removing unused files or applications.",
        "warning": "Disk usage is elevated; consider cleaning up unused files soon.",
        "spike": "Check for large files recently written to disk.",
    },
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _recent_values(history: list[dict], field: str, n: int) -> list[float]:
    """Last n numeric values for `field`, oldest-to-newest (history is already ordered that way)."""
    tail = history[-n:]
    return [row[field] for row in tail if isinstance(row.get(field), (int, float))]


def _check_sustained(history: list[dict], field: str) -> Insight | None:
    recent = _recent_values(history, field, SUSTAINED_WINDOW)
    if len(recent) < SUSTAINED_WINDOW:
        return None  # not enough recent samples to call this "sustained"

    avg = mean(recent)
    label = METRIC_LABELS[field]

    if avg >= CRITICAL_THRESHOLD:
        return Insight(
            metric=field,
            severity="critical",
            title=f"High {label} Usage",
            message=(
                f"{label} usage has remained above the critical threshold "
                f"(avg {avg:.1f}% over the last {len(recent)} samples)."
            ),
            suggestion=SUGGESTIONS[field]["critical"],
            timestamp=_now(),
        )

    if avg >= WARNING_THRESHOLD:
        return Insight(
            metric=field,
            severity="warning",
            title=f"Elevated {label} Usage",
            message=(
                f"{label} usage is elevated "
                f"(avg {avg:.1f}% over the last {len(recent)} samples)."
            ),
            suggestion=SUGGESTIONS[field]["warning"],
            timestamp=_now(),
        )

    return None


def _check_spike(history: list[dict], field: str) -> Insight | None:
    recent = _recent_values(history, field, 3)
    if len(recent) < 2:
        return None

    delta = recent[-1] - recent[-2]
    if delta >= SPIKE_DELTA_THRESHOLD:
        label = METRIC_LABELS[field]
        return Insight(
            metric=field,
            severity="warning",
            title=f"{label} Spike Detected",
            message=(
                f"{label} usage increased by {delta:.1f} percentage points "
                f"between recent samples ({recent[-2]:.1f}% \u2192 {recent[-1]:.1f}%)."
            ),
            suggestion=SUGGESTIONS[field]["spike"],
            timestamp=_now(),
        )
    return None


def build_insights(limit: int = 100) -> InsightsResponse:
    """
    Analyze real stored metrics history and produce deterministic,
    threshold-based insights. Never fabricates data; if there isn't
    enough history to analyze, says so explicitly instead of
    defaulting to "normal".
    """
    history = fetch_metrics_history(limit=limit)
    sample_count = len(history)

    if sample_count < MIN_SAMPLES_FOR_ANALYSIS:
        return InsightsResponse(
            insights=[
                Insight(
                    metric="system",
                    severity="insufficient_data",
                    title="Not Enough Data Yet",
                    message=(
                        f"Only {sample_count} sample(s) collected so far. "
                        f"At least {MIN_SAMPLES_FOR_ANALYSIS} are needed before "
                        f"insights can be reliably determined."
                    ),
                    suggestion="Keep the monitoring service running to collect more data.",
                    timestamp=_now(),
                )
            ],
            count=1,
            sample_count=sample_count,
            generated_at=_now(),
        )

    insights: list[Insight] = []
    for field in ("cpu", "ram", "disk"):
        sustained = _check_sustained(history, field)
        if sustained is not None:
            insights.append(sustained)
            continue  # avoid redundant spike noise on top of a sustained finding

        spike = _check_spike(history, field)
        if spike is not None:
            insights.append(spike)

    if not insights:
        insights.append(
            Insight(
                metric="system",
                severity="info",
                title="System Operating Normally",
                message="No significant CPU, RAM, or disk anomalies were detected.",
                suggestion="No action is required.",
                timestamp=_now(),
            )
        )

    return InsightsResponse(
        insights=insights,
        count=len(insights),
        sample_count=sample_count,
        generated_at=_now(),
    )
