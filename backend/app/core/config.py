from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py -> project root is 3 levels up
PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATABASE_PATH = PROJECT_ROOT / "data" / "database.db"


class Settings(BaseSettings):
    """Application settings. Change PROMETHEUS_URL in .env later if needed."""

    app_name: str = "AI Laptop Monitoring API"
    prometheus_url: str = "http://localhost:9090"
    database_path: str = str(DEFAULT_DATABASE_PATH)

    # Step 4: Ollama / LLM settings (additive)
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:3b-instruct"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
