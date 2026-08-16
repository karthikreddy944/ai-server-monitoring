from fastapi import APIRouter, HTTPException, Query

from app.schemas.insights import InsightsResponse
from app.services.insights import build_insights

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("", response_model=InsightsResponse)
async def get_insights(
    limit: int = Query(default=100, ge=1, le=1000),
) -> InsightsResponse:
    try:
        return build_insights(limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
