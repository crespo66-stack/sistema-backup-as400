from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models.user    import User
from app.models.journal import Journal
from app.models.backup  import Backup
from app.schemas.dashboard import DashboardStats, JournalTypeCount
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

JOURNAL_TYPES = ["Audit", "System", "Application", "Security"]


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Datos del Panel de Control."""
    total_journals  = db.query(Journal).count()
    active_journals = db.query(Journal).filter(Journal.status == "activo").count()
    total_storage   = db.query(func.coalesce(func.sum(Journal.size_mb), 0)).scalar()
    total_users     = db.query(User).count()

    counts = dict(db.query(Journal.type, func.count(Journal.id)).group_by(Journal.type).all())
    by_type = [JournalTypeCount(type=t, count=counts.pop(t, 0)) for t in JOURNAL_TYPES]
    by_type += [JournalTypeCount(type=t, count=c) for t, c in counts.items()]  # tipos no previstos

    recent = db.query(Backup).order_by(desc(Backup.created_at), desc(Backup.id)).limit(5).all()

    return DashboardStats(
        total_journals=total_journals,
        active_journals=active_journals,
        total_storage_mb=round(float(total_storage), 1),
        total_users=total_users,
        journals_by_type=by_type,
        recent_activity=recent,
    )