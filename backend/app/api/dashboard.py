from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user    import User
from app.models.journal import Journal
from app.models.backup  import Backup, BackupStatus
from app.models.alert   import Alert, AlertSeverity
from app.schemas.dashboard import DashboardStats
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """KPIs principales del dashboard."""
    total_journals  = db.query(Journal).count()
    active_journals = db.query(Journal).filter(Journal.is_active == True).count()

    total_backups   = db.query(Backup).count()
    successful      = db.query(Backup).filter(Backup.status == BackupStatus.completed).count()
    failed          = db.query(Backup).filter(Backup.status == BackupStatus.failed).count()
    running         = db.query(Backup).filter(Backup.status == BackupStatus.running).count()

    pending_alerts  = db.query(Alert).filter(Alert.is_read == False).count()
    critical_alerts = db.query(Alert).filter(
        Alert.severity == AlertSeverity.critical,
        Alert.is_resolved == False,
    ).count()

    last_backup = (
        db.query(Backup)
        .filter(Backup.status == BackupStatus.completed)
        .order_by(Backup.completed_at.desc())
        .first()
    )

    success_rate = round((successful / total_backups * 100), 2) if total_backups > 0 else 0.0

    return DashboardStats(
        total_journals=total_journals,
        active_journals=active_journals,
        total_backups=total_backups,
        successful_backups=successful,
        failed_backups=failed,
        running_backups=running,
        success_rate=success_rate,
        pending_alerts=pending_alerts,
        critical_alerts=critical_alerts,
        last_backup_at=last_backup.completed_at if last_backup else None,
    )