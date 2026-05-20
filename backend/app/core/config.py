from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Aplicación ───────────────────────────────────────
    APP_NAME: str = "Sistema Backup AS/400"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Base de datos PostgreSQL ─────────────────────────
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/backup_as400"

    # ── Seguridad JWT ────────────────────────────────────
    SECRET_KEY: str = "supersecretkey-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    # ── Admin por defecto (seed inicial) ─────────────────
    FIRST_ADMIN_EMAIL: str = "admin@sistema.com"
    FIRST_ADMIN_USERNAME: str = "admin"
    FIRST_ADMIN_PASSWORD: str = "Admin1234!"
    FIRST_ADMIN_FULLNAME: str = "Administrador del Sistema"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()