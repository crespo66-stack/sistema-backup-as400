from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Backup(Base):
    """Historial de operaciones de respaldo (Backup completo / incremental / restauración)."""
    __tablename__ = "backups"

    id               = Column(Integer, primary_key=True, index=True)
    journal_name     = Column(String(255), nullable=False)                          # QAUDJRN
    operation_type   = Column(String(30),  nullable=False, default="Backup Completo")  # Backup Completo | Backup Incremental | Restauracion
    result           = Column(String(20),  nullable=False, default="exitoso")          # exitoso | fallido
    size_mb          = Column(Numeric(12, 1), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    executed_by      = Column(String(255), nullable=True)                           # Nombre del operador
    notes            = Column(Text, nullable=True)

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    created_by_user = relationship("User", back_populates="backups")