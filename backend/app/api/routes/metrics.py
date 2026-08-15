from fastapi import APIRouter, HTTPException, Query

from app.schemas.metrics import (
    MetricHistoryRecord,
    MetricValue,
    MetricsHistoryResponse,
    MetricsSummary,
)
from app.services.metrics_history import get_metrics_history, save_metrics_snapshot
from app.services.prometheus import prometheus_service

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/cpu", response_model=MetricValue)
async def get_cpu() -> MetricValue:
    try:
        value = await prometheus_service.get_cpu_percent()
        return MetricValue(value=round(value, 2), instance="laptop")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/ram", response_model=MetricValue)
async def get_ram() -> MetricValue:
    try:
        value = await prometheus_service.get_ram_percent()
        return MetricValue(value=round(value, 2), instance="laptop")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/disk", response_model=MetricValue)
async def get_disk() -> MetricValue:
    try:
        value = await prometheus_service.get_disk_percent(volume="C:")
        return MetricValue(value=round(value, 2), instance="laptop")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/summary", response_model=MetricsSummary)
async def get_metrics_summary() -> MetricsSummary:
    """One call for the dashboard: CPU + RAM + disk."""
    try:
        cpu = await prometheus_service.get_cpu_percent()
        ram = await prometheus_service.get_ram_percent()
        disk = await prometheus_service.get_disk_percent(volume="C:")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    summary = MetricsSummary(
        cpu=MetricValue(value=round(cpu, 2), instance="laptop"),
        ram=MetricValue(value=round(ram, 2), instance="laptop"),
        disk=MetricValue(value=round(disk, 2), instance="laptop"),
    )

    # Save only after Prometheus succeeded (inside try block, after summary built)
    save_metrics_snapshot(summary)

    return summary


@router.get("/history", response_model=MetricsHistoryResponse)
async def get_metrics_history_endpoint(
    limit: int = Query(default=100, ge=1, le=1000),
) -> MetricsHistoryResponse:
    """Return stored historical CPU/RAM/Disk snapshots."""
    rows = get_metrics_history(limit=limit)
    records = [MetricHistoryRecord(**row) for row in rows]
    return MetricsHistoryResponse(records=records, count=len(records))