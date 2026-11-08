from pydantic import BaseModel, EmailStr, Field


# ── Token JWT ────────────────────────────────────────────
class Token(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"


# ── Registro público ─────────────────────────────────────
# Nota: NO incluye "role" ni "is_active". Quien se registra solo por
# su cuenta recibe siempre el rol de menor permiso (auditor, solo lectura).
class RegisterRequest(BaseModel):
    email:     EmailStr
    username:  str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2)
    password:  str = Field(..., min_length=8)


# ── Login ────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


# ── Refresh token ────────────────────────────────────────
class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Recuperar contraseña ─────────────────────────────────
class PasswordResetRequest(BaseModel):
    email: EmailStr


# ── Confirmar nueva contraseña ───────────────────────────
class PasswordResetConfirm(BaseModel):
    token:        str
    new_password: str = Field(..., min_length=8)