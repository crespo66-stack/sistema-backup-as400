from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from sqlalchemy import Enum as SAEnum
from app.core.database import Base


class BackupStatus(str, enum.Enum):
    pending   = "pending"
    running   = "running"
    completed = "completed"
    failed    = "failed"
    cancelled = "cancelled"


class Backup(Base):
    __tablename__ = "backups"

    id           = Column(Integer, primary_key=True, index=True)
    journal_id   = Column(Integer, ForeignKey("journals.id"), nullable=False)
    created_by   = Column(Integer, ForeignKey("users.id"),    nullable=False)

    status       = Column(SAEnum(BackupStatus), default=BackupStatus.pending, nullable=False)

    # Tiempos
    started_at   = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Resultado
    receiver         = Column(String(255), nullable=True)   # Nombre del receiver AS/400
    file_path        = Column(String(500), nullable=True)
    file_size_bytes  = Column(BigInteger,  nullable=True)
    records_count    = Column(Integer,     nullable=True)
    error_message    = Column(Text,        nullable=True)

    backup_metadata  = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    journal          = relationship("Journal", back_populates="backups")
    created_by_user  = relationship("User",    back_populates="backups")