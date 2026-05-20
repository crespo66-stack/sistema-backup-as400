from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from sqlalchemy import Enum as SAEnum
from app.core.database import Base


class AlertSeverity(str, enum.Enum):
    info     = "info"
    warning  = "warning"
    error    = "error"
    critical = "critical"


class AlertType(str, enum.Enum):
    backup_failed      = "backup_failed"
    journal_inactive   = "journal_inactive"
    connection_error   = "connection_error"
    db2_error          = "db2_error"
    system             = "system"


class Alert(Base):
    __tablename__ = "alerts"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    message     = Column(Text,        nullable=False)
    severity    = Column(SAEnum(AlertSeverity), default=AlertSeverity.info, nullable=False)
    type        = Column(SAEnum(AlertType),     default=AlertType.system,   nullable=False)
    is_read     = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    source      = Column(String(100), nullable=True)

    # Referencia opcional al backup que generó la alerta
    backup_id   = Column(Integer, ForeignKey("backups.id"), nullable=True)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)