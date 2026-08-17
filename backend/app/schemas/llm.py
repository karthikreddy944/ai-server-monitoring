from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class ExplainRequest(BaseModel):
    metric: Optional[Literal["cpu", "ram", "disk"]] = None


class ExplainResponse(BaseModel):
    metric: Optional[str] = None
    title: str
    explanation: str
    recommendation: str
    source: Literal["llm", "fallback"]
    generated_at: datetime
