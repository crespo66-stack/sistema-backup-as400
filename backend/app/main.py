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
from app.models.journal import Journal
from app.models.backup import Backup
from datetime import date, datetime, timezone

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
                role=UserRole.admin.value,
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


# ── Seed: datos de ejemplo (los mismos de las pantallas del Word) ──
DEMO_PASSWORD = "Usuario123!"

def seed_demo_data():
    db = SessionLocal()
    try:
        # Usuarios
        if db.query(User).count() <= 1:
            demo_users = [
                ("Samuel Crespo",    "Samuel@gmail.com",           "operator", True,  datetime(2026, 11, 5,  9, 0, tzinfo=timezone.utc)),
                ("Samuel Contreras", "samuelC@outlook.com",        "dba",      True,  datetime(2026, 6, 16, 22, 57, tzinfo=timezone.utc)),
                ("Carlos Rodríguez", "crodriguez@empresa.com",     "auditor",  True,  datetime(2026, 6, 16, 22, 57, tzinfo=timezone.utc)),
                ("María López",      "mlopez@empresa.com",         "operator", True,  datetime(2026, 6, 16, 22, 57, tzinfo=timezone.utc)),
                ("Ana Martínez",     "amartinez@empresa.com",      "operator", False, datetime(2026, 6, 16, 22, 57, tzinfo=timezone.utc)),
                ("Guillermo Crespo", "gcrespo@empresa.com",        "dba",      True,  datetime(2026, 6, 16, 22, 57, tzinfo=timezone.utc)),
            ]
            for full_name, email, role, active, created in demo_users:
                if db.query(User).filter(User.email == email).first():
                    continue
                db.add(User(
                    email=email, username=email.split("@")[0], full_name=full_name,
                    hashed_password=get_password_hash(DEMO_PASSWORD),
                    role=role, is_active=active, is_verified=True, created_at=created,
                ))
            db.commit()

        # Journals
        if db.query(Journal).count() == 0:
            demo_journals = [
                ("@journal", "qsys",    "System",      "activo",     "media", 650.0,  None,       None),
                ("AUDJRN02", "AUDLIB",  "Audit",       "activo",     "alta",  384.9,  "RCVR0022", None),
                ("QSYSJRN",  "QSYS",    "System",      "activo",     "alta",  1024.7, "RCVR0012", None),
                ("QAUDJRN",  "QSYS",    "Audit",       "activo",     "alta",  512.3,  "RCVR0045", None),
                ("APPJRN01", "PRODLIB", "Application", "activo",     "media", 256.1,  "RCVR0003", None),
                ("SECJRN01", "QSYS",    "Security",    "respaldado", "media", 128.5,  "RCVR0008", None),
                ("APPJRN02", "TESTLIB", "Application", "inactivo",   "baja",  64.2,   "RCVR0001", None),
            ]
            # Se insertan de abajo hacia arriba para que la lista (id desc) quede igual que en el Word
            for name, lib, typ, status, prio, size, rcv, created in reversed(demo_journals):
                db.add(Journal(name=name, library=lib, type=typ, status=status, priority=prio,
                               size_mb=size, current_receiver=rcv, as400_created_at=created))
            db.commit()

        # Historial de backups
        if db.query(Backup).count() == 0:
            when = datetime(2026, 6, 16, 22, 57, tzinfo=timezone.utc)
            demo_backups = [
                ("QSYSJRN",  "Backup Incremental", "exitoso", 128.1, 89,  "María López"),
                ("AUDJRN02", "Restauracion",       "exitoso", 384.9, 312, "María López"),
                ("APPJRN01", "Backup Completo",    "fallido", None,  15,  "Carlos Rodríguez"),
                ("SECJRN01", "Backup Completo",    "exitoso", 128.5, 67,  "Guillermo Crespo"),
                ("QAUDJRN",  "Backup Completo",    "exitoso", 512.3, 245, "Guillermo Crespo"),
            ]
            for i, (jn, op, res, size, dur, by) in enumerate(demo_backups):
                db.add(Backup(journal_name=jn, operation_type=op, result=res, size_mb=size,
                              duration_seconds=dur, executed_by=by,
                              created_at=when.replace(second=i)))
            db.commit()
        print("✅ Datos de ejemplo verificados")
    finally:
        db.close()


# ── Lifespan: acciones al iniciar/cerrar la app ──────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Al iniciar
    Base.metadata.create_all(bind=engine)
    create_first_admin()
    seed_demo_data()
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
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
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