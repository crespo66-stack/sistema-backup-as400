from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DashboardStats(BaseModel):
    # Journals
    total_journals:  int
    active_journals: int

    # Backups
    total_backups:      int
    successful_backups: int
    failed_backups:     int
    running_backups:    int
    success_rate:       float

    # Alertas
    pending_alerts:  int
    critical_alerts: int

    # Último backup exitoso
    last_backup_at: Optional[datetime]