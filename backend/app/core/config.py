from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings. Change PROMETHEUS_URL in .env later if needed."""

    app_name: str = "AI Laptop Monitoring API"
    prometheus_url: str = "http://localhost:9090"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()