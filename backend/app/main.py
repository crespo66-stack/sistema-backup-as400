from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config   import settings
from app.core.database import engine
from app.core.security import get_password_hash

# Importar todos los modelos para que SQLAlchemy los registre
import app.models  # noqa: F401
from app.core.database import Base, SessionLocal
from app.models.user import User, UserRole

from app.api import auth, users, journals, backups, alerts, connections, dashboard


# ── Seed: crear admin por defecto si no existe ────────────
def create_first_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if not existing:
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                username=settings.FIRST_ADMIN_USERNAME,
                full_name=settings.FIRST_ADMIN_FULLNAME,
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.admin,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin creado: {settings.FIRST_ADMIN_EMAIL} / {settings.FIRST_ADMIN_PASSWORD}")
        else:
            print(f"ℹ️  Admin ya existe: {settings.FIRST_ADMIN_EMAIL}")
    finally:
        db.close()


# ── Lifespan: acciones al iniciar/cerrar la app ──────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al iniciar
    Base.metadata.create_all(bind=engine)
    create_first_admin()
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} iniciado")
    yield
    # Al cerrar
    print("🛑 Servidor detenido")


# ── Aplicación FastAPI ────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para sistema de backup de journals AS/400 con DB2",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── Middleware CORS ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router,        prefix=API_PREFIX)
app.include_router(users.router,       prefix=API_PREFIX)
app.include_router(journals.router,    prefix=API_PREFIX)
app.include_router(backups.router,     prefix=API_PREFIX)
app.include_router(alerts.router,      prefix=API_PREFIX)
app.include_router(connections.router, prefix=API_PREFIX)
app.include_router(dashboard.router,   prefix=API_PREFIX)


# ── Endpoints base ────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs":    "/api/docs",
        "status":  "running",
    }


@app.get("/health", tags=["Root"])
def health():
    return {"status": "ok"}