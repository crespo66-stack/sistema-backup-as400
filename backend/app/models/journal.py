from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, Text
from sqlalchemy.sql import func

from app.core.database import Base


class Journal(Base):
    __tablename__ = "journals"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(255), nullable=False)               # QAUDJRN
    library          = Column(String(255), nullable=False)               # QSYS
    type             = Column(String(30),  nullable=False, default="System")   # System | Audit | Application | Security
    status           = Column(String(20),  nullable=False, default="activo")   # activo | respaldado | inactivo
    priority         = Column(String(20),  nullable=False, default="media")    # alta | media | baja
    size_mb          = Column(Numeric(12, 1), nullable=False, default=0)
    current_receiver = Column(String(255), nullable=True)                # RCVR0001
    as400_created_at = Column(Date, nullable=True)                       # Fecha creación AS400
    description      = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())