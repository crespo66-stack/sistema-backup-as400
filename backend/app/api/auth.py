from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token,
)
from app.models.user import User
from app.schemas import (
    Token, LoginRequest, RegisterRequest, UserResponse,
    RefreshTokenRequest, PasswordResetRequest, PasswordResetConfirm,
)
from app.api.deps import get_current_user
from app.services.email import send_reset_email

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_in: RegisterRequest, db: Session = Depends(get_db)):
    """Registro público. Siempre crea el usuario con el rol de menor permiso (auditor).
    Un administrador puede cambiar el rol luego desde la pantalla Usuarios."""
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role="auditor",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Iniciar sesión y obtener tokens JWT."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada. Contacta al administrador.")

    return Token(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
    )


@router.post("/refresh", response_model=Token)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Renovar access token usando refresh token."""
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario no válido")

    return Token(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
    )


@router.post("/forgot-password")
def forgot_password(
    body: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Solicitar enlace de recuperación de contraseña (se envía por correo)."""
    user = db.query(User).filter(User.email == body.email).first()
    if user and user.is_active:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_MINUTES)
        db.commit()

        reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"
        # El envío va en segundo plano: la respuesta es igual exista o no el email
        background_tasks.add_task(send_reset_email, user.email, user.full_name, reset_link)

    # Siempre retornar 200 para no revelar si el email existe
    return {"message": "Si el email existe, recibirás un enlace de recuperación en breve"}


@router.post("/reset-password")
def reset_password(body: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Confirmar nueva contraseña con el token recibido."""
    user = db.query(User).filter(User.reset_token == body.token).first()
    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Token inválido")

    # PostgreSQL devuelve la fecha con zona horaria; SQLite no. Se normaliza a UTC.
    expires = user.reset_token_expires
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expirado. Solicita uno nuevo.")

    user.hashed_password    = get_password_hash(body.new_password)
    user.reset_token        = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Obtener datos del usuario autenticado."""
    return current_user