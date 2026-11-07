from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    api_port: int = 3001
    api_origin: str = "http://localhost:3001"
    web_origin: str = "http://localhost:3000"
    database_url: str
    redis_url: str = "redis://127.0.0.1:6379/0"
    app_secret_key: str
    session_cookie_name: str = "salesmora_session"
    smtp_host: str = "127.0.0.1"
    smtp_port: int = 1025
    smtp_secure: bool = False
    smtp_username: str | None = None
    smtp_password: str | None = None
    email_from: str = "Salesmora <no-reply@salesmora.test>"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        value = value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value.replace("?schema=public", "")

    @field_validator("app_secret_key")
    @classmethod
    def validate_secret(cls, value: str) -> str:
        if len(value) < 32:
            raise ValueError("APP_SECRET_KEY must be at least 32 characters")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
