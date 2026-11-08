from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin    = "admin"      # Administrador
    operator = "operator"   # Operador
    dba      = "dba"        # DBA
    auditor  = "auditor"    # Auditor


# ── Crear usuario (modal "Registrar Usuario") ────────────
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    email:     EmailStr
    password:  str = Field(..., min_length=8)
    role:      UserRole = UserRole.operator
    is_active: bool = True
    # Opcional: si no se envía, se genera a partir del correo
    username:  Optional[str] = Field(None, min_length=3, max_length=50)


# ── Actualizar usuario ───────────────────────────────────
class UserUpdate(BaseModel):
    full_name:  Optional[str]       = Field(None, min_length=2)
    email:      Optional[EmailStr]  = None
    password:   Optional[str]       = Field(None, min_length=8)
    role:       Optional[UserRole]  = None
    is_active:  Optional[bool]      = None
    avatar_url: Optional[str]       = None


# ── Respuesta pública del usuario ────────────────────────
class UserResponse(BaseModel):
    id:          int
    email:       str
    username:    str
    full_name:   str
    role:        UserRole
    is_active:   bool
    is_verified: bool
    avatar_url:  Optional[str]
    created_at:  datetime

    class Config:
        from_attributes = True


# ── Cambio de contraseña ─────────────────────────────────
class UserChangePassword(BaseModel):
    current_password: str
    new_password:     str = Field(..., min_length=8)