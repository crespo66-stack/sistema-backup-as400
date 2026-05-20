from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class AS400Connection(Base):
    __tablename__ = "as400_connections"

    id                 = Column(Integer, primary_key=True, index=True)
    name               = Column(String(255), nullable=False)
    host               = Column(String(255), nullable=False)
    port               = Column(Integer, default=446)
    database           = Column(String(255), nullable=False)
    username           = Column(String(255), nullable=False)
    password_encrypted = Column(Text, nullable=False)
    library            = Column(String(255), nullable=True)
    is_active          = Column(Boolean, default=True)
    is_default         = Column(Boolean, default=False)

    # Resultado del último test de conexión
    last_tested_at    = Column(DateTime(timezone=True), nullable=True)
    last_test_success = Column(Boolean, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    journals = relationship("Journal", back_populates="connection")