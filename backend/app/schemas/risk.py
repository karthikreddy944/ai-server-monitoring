from datetime import datetime

from pydantic import BaseModel, Field


class MetricRisk(BaseModel):
    """Combined severity + trend risk assessment for one metric."""

    current: float
    severity: str = Field(..., description="info | warning | critical")
    trend: str = Field(..., description="increasing | decreasing | stable | insufficient_data")
    change_percent: float | None = Field(None, description="From the Step 2 trend engine")
    risk_level: str = Field(..., description="low | medium | high")
    prediction: str
    reason: str

    # --- Step 3.5: time-to-threshold prediction (additive) ---
    threshold: float = Field(..., description="Critical threshold this metric is measured against")
    rate_percent_points_per_minute: float | None = Field(
        None, description="Recent rate of change, only set when an estimate was computed"
    )
    time_to_threshold_minutes: float | None = Field(
        None, description="Estimated minutes until the threshold is reached, if reliable"
    )
    time_prediction_status: str = Field(
        ..., description="already_reached | not_applicable | unreliable | estimated"
    )
    time_prediction: str


class RiskResponse(BaseModel):
    """Risk assessment for cpu/ram/disk, derived from real severity + trend data."""

    cpu: MetricRisk
    ram: MetricRisk
    disk: MetricRisk
    sample_count: int
    generated_at: datetime
