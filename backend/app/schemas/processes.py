from datetime import datetime

from pydantic import BaseModel, Field


class ProcessInfo(BaseModel):
    """Real process reading from psutil - never fabricated."""

    pid: int
    name: str
    cpu_percent: float = Field(..., description="Percent of one CPU core, psutil convention")
    memory_percent: float = Field(..., description="Percent of total system RAM")
    memory_mb: float = Field(..., description="Resident memory (RSS) in megabytes")


class TopProcessesResponse(BaseModel):
    """Top processes by CPU and by memory, from a single real psutil snapshot."""

    top_cpu: list[ProcessInfo]
    top_memory: list[ProcessInfo]
    process_count: int = Field(..., description="Total processes successfully read in this snapshot")
    generated_at: datetime
