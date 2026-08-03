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