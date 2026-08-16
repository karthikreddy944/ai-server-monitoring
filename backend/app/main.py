from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, insights, metrics
from app.core.config import settings
from app.db.database import init_db

app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def on_startup() -> None:
    """Create SQLite database and tables when the app starts."""
    init_db()


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
app.include_router(insights.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "AI Laptop Monitoring API",
        "docs": "/docs",
    }