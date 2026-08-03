from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, metrics
from app.core.config import settings

app = FastAPI(title=settings.app_name)

# CORS: lets React (different port) call this API later on Day 3
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(metrics.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "AI Laptop Monitoring API",
        "docs": "/docs",
    }