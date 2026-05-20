from pydantic import BaseModel, EmailStr, Field


# ── Token JWT ────────────────────────────────────────────
class Token(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"


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