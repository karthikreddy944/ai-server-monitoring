from fastapi import APIRouter, HTTPException, Query

from app.schemas.trends import TrendsResponse
from app.services.trends import build_trends

router = APIRouter(prefix="/api/trends", tags=["trends"])


@router.get("", response_model=TrendsResponse)
async def get_trends(
    limit: int = Query(default=100, ge=1, le=1000),
) -> TrendsResponse:
    try:
        return build_trends(limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
