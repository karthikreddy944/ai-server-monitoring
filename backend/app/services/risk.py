from datetime import datetime, timezone
from statistics import mean

# Read-only imports: reuses Day 5's actual threshold constants and metric
# labels as the single source of truth, and Step 2's trend engine, without
# modifying either file.
from app.services.insights import CRITICAL_THRESHOLD, METRIC_LABELS, WARNING_THRESHOLD
from app.services.trends import MINIMUM_SAMPLES, build_trends
from app.db.database import fetch_metrics_history
from app.schemas.risk import MetricRisk, RiskResponse

PREDICTIONS = {
    "cpu": "If this trend continues, the system may become slow or unresponsive.",
    "ram": "If this trend continues, applications may become slow or unresponsive.",
    "disk": (
        "If this trend continues, the system may run low on storage and "
        "applications may fail to save data."
    ),
}
LOW_RISK_PREDICTION = "No significant risk expected if current conditions continue."

# --- Step 3.5: time-to-threshold prediction ---
MIN_ELAPSED_MINUTES_FOR_RATE = 1.0
MAX_REASONABLE_MINUTES = 7 * 24 * 60  # 7 days - beyond this we don't report a specific number


def _parse_timestamp(raw: str) -> datetime:
    return datetime.fromisoformat(raw)


def _time_prediction_text(label: str, status: str, minutes: float | None) -> str:
    if status == "already_reached":
        return f"{label} is already above the critical threshold."
    if status == "not_applicable":
        return (
            f"{label} usage is not currently trending upward, so a "
            f"time-to-threshold estimate is not applicable."
        )
    if status == "unreliable":
        return "Recent usage is fluctuating too much to make a reliable time estimate."
    # estimated
    return (
        f"If the current trend continues, {label} may reach the critical "
        f"threshold in approximately {minutes:.0f} minutes."
    )


def _compute_time_to_threshold(
    field: str, label: str, current: float, threshold: float, trend: str, limit: int
) -> tuple[float | None, float | None, str, str]:
    """
    Returns (rate_percent_points_per_minute, time_to_threshold_minutes,
    time_prediction_status, time_prediction_text).

    Uses real stored timestamps - never assumes a fixed sampling
    interval. Returns null/"unreliable" rather than inventing a number
    whenever the data doesn't support a trustworthy estimate.
    """
    if current >= threshold:
        return None, 0.0, "already_reached", _time_prediction_text(label, "already_reached", None)

    if trend != "increasing":
        return None, None, "not_applicable", _time_prediction_text(label, "not_applicable", None)

    history = fetch_metrics_history(limit=limit)
    rows = [
        (row["timestamp"], row[field])
        for row in history
        if isinstance(row.get(field), (int, float)) and row.get("timestamp")
    ]

    if len(rows) < MINIMUM_SAMPLES:
        # Trend was "increasing" from build_trends() using the same limit,
        # so this should not normally happen - defensive fallback only.
        return None, None, "unreliable", _time_prediction_text(label, "unreliable", None)

    midpoint = len(rows) // 2
    first_half = rows[:midpoint]
    second_half = rows[midpoint:]

    try:
        first_times = [_parse_timestamp(ts) for ts, _ in first_half]
        second_times = [_parse_timestamp(ts) for ts, _ in second_half]
    except ValueError:
        return None, None, "unreliable", _time_prediction_text(label, "unreliable", None)

    avg_first_value = mean(v for _, v in first_half)
    avg_second_value = mean(v for _, v in second_half)
    avg_first_epoch = mean(t.timestamp() for t in first_times)
    avg_second_epoch = mean(t.timestamp() for t in second_times)

    elapsed_minutes = (avg_second_epoch - avg_first_epoch) / 60.0
    if elapsed_minutes < MIN_ELAPSED_MINUTES_FOR_RATE:
        return None, None, "unreliable", _time_prediction_text(label, "unreliable", None)

    change = avg_second_value - avg_first_value
    rate = change / elapsed_minutes

    if rate <= 0:
        return round(rate, 4), None, "unreliable", _time_prediction_text(label, "unreliable", None)

    minutes_needed = (threshold - current) / rate

    if minutes_needed <= 0 or minutes_needed > MAX_REASONABLE_MINUTES:
        return round(rate, 4), None, "unreliable", _time_prediction_text(label, "unreliable", None)

    rounded_minutes = round(minutes_needed, 1)
    return (
        round(rate, 4),
        rounded_minutes,
        "estimated",
        _time_prediction_text(label, "estimated", rounded_minutes),
    )


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _classify_severity(value: float) -> str:
    """Same thresholds as Day 5's insights.py - imported, not re-defined."""
    if value >= CRITICAL_THRESHOLD:
        return "critical"
    if value >= WARNING_THRESHOLD:
        return "warning"
    return "info"


def _classify_risk(severity: str, trend: str) -> str:
    """Approved decision table:
    info            -> low, regardless of trend
    warning + increasing              -> medium
    warning + stable/decreasing/insufficient_data -> low
    critical + increasing             -> high
    critical + stable/decreasing/insufficient_data -> medium
    """
    if severity == "info":
        return "low"
    if severity == "warning":
        return "medium" if trend == "increasing" else "low"
    if severity == "critical":
        return "high" if trend == "increasing" else "medium"
    return "low"  # defensive fallback, should not occur with current severities


def _build_reason(label: str, severity: str, risk_level: str) -> str:
    if risk_level == "low":
        if severity == "info":
            return f"{label} usage is within a normal range."
        return f"{label} usage is elevated but not currently trending upward."
    if risk_level == "medium":
        if severity == "warning":
            return f"{label} usage is elevated and the recent trend is increasing."
        return f"{label} usage is already high, though the recent trend is not worsening."
    if risk_level == "high":
        return f"{label} usage is already very high and the recent trend is increasing."
    return f"{label} usage status could not be determined."


def build_risk(limit: int = 100) -> RiskResponse:
    """
    Combine Day 5's severity thresholds with Step 2's trend direction to
    produce a deterministic, explainable risk level per metric. No ML,
    no forecasting model - a rule-based combination of two things that
    are each already computed elsewhere from real stored data.
    """
    trends_response = build_trends(limit=limit)
    metric_risks: dict[str, MetricRisk] = {}

    for field in ("cpu", "ram", "disk"):
        trend_result = trends_response.trends[field]
        label = METRIC_LABELS[field]
        trend = trend_result.direction

        # current can be None only if history was completely empty
        # (even fewer than 1 sample) - defensive handling, not expected
        # in practice once the system has been running.
        current = trend_result.current if trend_result.current is not None else 0.0
        severity = _classify_severity(current)
        risk_level = _classify_risk(severity, trend)
        reason = _build_reason(label, severity, risk_level)
        prediction = LOW_RISK_PREDICTION if risk_level == "low" else PREDICTIONS[field]

        (
            rate,
            time_to_threshold_minutes,
            time_prediction_status,
            time_prediction,
        ) = _compute_time_to_threshold(
            field=field,
            label=label,
            current=current,
            threshold=CRITICAL_THRESHOLD,
            trend=trend,
            limit=limit,
        )

        metric_risks[field] = MetricRisk(
            current=round(current, 2),
            severity=severity,
            trend=trend,
            change_percent=trend_result.change_percent,
            risk_level=risk_level,
            prediction=prediction,
            reason=reason,
            threshold=CRITICAL_THRESHOLD,
            rate_percent_points_per_minute=rate,
            time_to_threshold_minutes=time_to_threshold_minutes,
            time_prediction_status=time_prediction_status,
            time_prediction=time_prediction,
        )

    return RiskResponse(
        cpu=metric_risks["cpu"],
        ram=metric_risks["ram"],
        disk=metric_risks["disk"],
        sample_count=trends_response.sample_count,
        generated_at=_now(),
    )
