import httpx

from app.core.config import settings


class PrometheusService:
    """Talks to Prometheus and runs PromQL queries."""

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or settings.prometheus_url).rstrip("/")

    async def query(self, promql: str) -> float:
        """
        Run an instant PromQL query and return a single float.
        Raises ValueError if Prometheus returns no usable data.
        """
        url = f"{self.base_url}/api/v1/query"
        params = {"query": promql}

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()

        if payload.get("status") != "success":
            raise ValueError(f"Prometheus query failed: {payload}")

        result = payload["data"]["result"]
        if not result:
            raise ValueError(f"No data for query: {promql}")

        # Prometheus returns value as [timestamp, "123.45"]
        raw_value = result[0]["value"][1]
        return float(raw_value)

    async def get_cpu_percent(self) -> float:
        promql = (
            "100 - (avg(rate(windows_cpu_time_total{mode=\"idle\"}[1m])) * 100)"
        )
        return await self.query(promql)

    async def get_ram_percent(self) -> float:
        promql = (
            "(1 - (windows_memory_available_bytes / "
            "windows_memory_physical_total_bytes)) * 100"
        )
        return await self.query(promql)

    async def get_disk_percent(self, volume: str = "C:") -> float:
        promql = (
            f"(1 - (windows_logical_disk_free_bytes{{volume=\"{volume}\"}} / "
            f"windows_logical_disk_size_bytes{{volume=\"{volume}\"}})) * 100"
        )
        return await self.query(promql)


prometheus_service = PrometheusService()