from datetime import datetime

from pydantic import BaseModel, Field


class Insight(BaseModel):
    """One deterministic, rule-based insight derived from real stored metrics."""

    metric: str = Field(..., description="cpu | ram | disk | system")
    severity: str = Field(..., description="critical | warning | info | insufficient_data")
    title: str
    message: str
    suggestion: str
    timestamp: datetime


class InsightsResponse(BaseModel):
    """Full insights payload returned by GET /api/insights."""

    insights: list[Insight]
    count: int
    sample_count: int = Field(..., description="Number of history rows analyzed")
    generated_at: datetime
