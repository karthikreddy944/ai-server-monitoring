from fastapi import APIRouter

from app.schemas.llm import ExplainRequest, ExplainResponse
from app.services.llm_service import get_explanation

router = APIRouter(prefix="/api/insights", tags=["llm"])


@router.post("/explain", response_model=ExplainResponse)
async def explain(request: ExplainRequest = ExplainRequest()) -> ExplainResponse:
    return await get_explanation(request.metric)
