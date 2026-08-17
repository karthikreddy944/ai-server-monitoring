from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.schemas.processes import TopProcessesResponse
from app.services.process_monitor import get_top_processes

router = APIRouter(prefix="/api/processes", tags=["processes"])


# Plain `def`, not `async def`: get_top_processes() makes blocking
# psutil calls (including a sleep for CPU sampling). FastAPI runs
# sync route functions in a worker thread automatically, so this
# does not block the event loop the way an async def with a blocking
# call inside it would.
@router.get("/top", response_model=TopProcessesResponse)
def get_top(limit: int = Query(default=5, ge=1, le=20)) -> TopProcessesResponse:
    try:
        top_cpu, top_memory, process_count = get_top_processes(limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return TopProcessesResponse(
        top_cpu=top_cpu,
        top_memory=top_memory,
        process_count=process_count,
        generated_at=datetime.now(timezone.utc),
    )
