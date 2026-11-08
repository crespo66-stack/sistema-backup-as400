from fastapi import APIRouter
from . import auth, journals, backups, alerts, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(journals.router, prefix="/journals", tags=["journals"])
api_router.include_router(backups.router, prefix="/backups", tags=["backups"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])