from datetime import datetime

from pydantic import BaseModel, Field


class TrendResult(BaseModel):
    """Direction of change for one metric over the retrieved history window."""

    direction: str = Field(
        ..., description="increasing | decreasing | stable | insufficient_data"
    )
    change_percent: float | None = Field(
        None,
        description="Second-half average minus first-half average, in percentage points",
    )
    current: float | None = Field(None, description="Most recent stored value")
    average: float | None = Field(None, description="Mean value across the retrieved window")


class TrendsResponse(BaseModel):
    """Trend direction for cpu/ram/disk, computed from real stored history."""

    trends: dict[str, TrendResult]
    sample_count: int = Field(..., description="Number of history rows retrieved and analyzed")
    generated_at: datetime
