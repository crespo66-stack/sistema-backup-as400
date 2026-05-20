from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class AlertSeverity(str, Enum):
    info     = "info"
    warning  = "warning"
    error    = "error"
    critical = "critical"


class AlertType(str, Enum):
    backup_failed    = "backup_failed"
    journal_inactive = "journal_inactive"
    connection_error = "connection_error"
    db2_error        = "db2_error"
    system           = "system"


class AlertResponse(BaseModel):
    id:          int
    title:       str
    message:     str
    severity:    AlertSeverity
    type:        AlertType
    is_read:     bool
    is_resolved: bool
    source:      Optional[str]
    backup_id:   Optional[int]
    created_at:  datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True