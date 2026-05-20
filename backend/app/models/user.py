from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    admin    = "admin"
    operator = "operator"
    viewer   = "viewer"


class User(Base):
    __tablename__ = "users"

    id                 = Column(Integer, primary_key=True, index=True)
    email              = Column(String(255), unique=True, index=True, nullable=False)
    username           = Column(String(100), unique=True, index=True, nullable=False)
    full_name          = Column(String(255), nullable=False)
    hashed_password    = Column(String(255), nullable=False)
    role               = Column(SAEnum(UserRole), default=UserRole.operator, nullable=False)
    is_active          = Column(Boolean, default=True)
    is_verified        = Column(Boolean, default=False)
    avatar_url         = Column(String(500), nullable=True)

    # Campos para recuperación de contraseña
    reset_token         = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    journals = relationship("Journal", back_populates="owner")
    backups  = relationship("Backup",  back_populates="created_by_user")