from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Journal(Base):
    __tablename__ = "journals"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(255), nullable=False)
    description   = Column(Text, nullable=True)
    library       = Column(String(255), nullable=False)
    journal_name  = Column(String(255), nullable=False)
    connection_id = Column(Integer, ForeignKey("as400_connections.id"), nullable=False)
    owner_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active     = Column(Boolean, default=True)

    # Programación automática
    schedule_cron  = Column(String(100), nullable=True)   # Ej: "0 2 * * *"
    retention_days = Column(Integer, default=30)

    # Datos del último backup exitoso
    last_backup_at     = Column(DateTime(timezone=True), nullable=True)
    last_backup_status = Column(String(50), nullable=True)

    extra_config = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    connection = relationship("AS400Connection", back_populates="journals")
    owner      = relationship("User",            back_populates="journals")
    backups    = relationship("Backup",          back_populates="journal")