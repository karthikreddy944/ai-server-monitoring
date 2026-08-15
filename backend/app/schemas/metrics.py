from datetime import datetime

from pydantic import BaseModel, Field


class MetricValue(BaseModel):
    """Single metric reading returned to the frontend."""

    value: float = Field(..., description="Metric value (usually percent)")
    unit: str = Field(default="percent", description="Unit of measurement")
    instance: str = Field(default="laptop", description="Source machine label")


class MetricsSummary(BaseModel):
    """Combined CPU, RAM, and disk for one dashboard call."""

    cpu: MetricValue
    ram: MetricValue
    disk: MetricValue


class MetricHistoryRecord(BaseModel):
    """One stored historical metrics snapshot."""

    id: int
    timestamp: datetime
    cpu: float
    ram: float
    disk: float
    instance: str


class MetricsHistoryResponse(BaseModel):
    """List of historical metrics records."""

    records: list[MetricHistoryRecord]
    count: int