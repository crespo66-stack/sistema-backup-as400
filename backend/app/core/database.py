from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


# ── Motor de base de datos ───────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # Verifica conexión antes de usarla
    pool_size=10,         # Conexiones simultáneas en el pool
    max_overflow=20,      # Conexiones extra permitidas
    echo=settings.DEBUG,  # Imprime SQL en consola si DEBUG=True
)

# ── Sesión de base de datos ──────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ── Clase base para todos los modelos ───────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency para FastAPI (inyección de sesión) ────────
def get_db():
    """
    Genera una sesión de base de datos por request.
    Se cierra automáticamente al terminar.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()