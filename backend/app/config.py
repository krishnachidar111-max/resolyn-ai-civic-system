from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Resolyn Phase 2 API"
    env: str = "development"
    secret_key: str = Field(default="dev-secret-change-in-production")
    database_url: str = "sqlite:///./resolyn.db"
    access_token_expire_minutes: int = 1440
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
