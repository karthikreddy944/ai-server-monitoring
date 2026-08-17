from fastapi import APIRouter, HTTPException, Query

from app.schemas.risk import RiskResponse
from app.services.risk import build_risk

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("", response_model=RiskResponse)
async def get_risk(
    limit: int = Query(default=100, ge=1, le=1000),
) -> RiskResponse:
    try:
        return build_risk(limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
