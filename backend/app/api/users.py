from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas import UserResponse, UserCreate, UserUpdate, UserChangePassword
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Usuarios"])


def _unique_username(db: Session, email: str) -> str:
    """Genera un username único a partir del correo (parte antes de la @)."""
    base = (email.split("@")[0] or "usuario")[:40]
    if len(base) < 3:
        base = base + "usr"
    username, n = base, 1
    while db.query(User).filter(User.username == username).first():
        n += 1
        username = f"{base}{n}"
    return username


@router.get("/", response_model=List[UserResponse])
def list_users(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(User)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(User.full_name.ilike(like), User.email.ilike(like), User.role.ilike(like)))
    return query.order_by(User.created_at.desc(), User.id.asc()).offset(skip).limit(limit).all()


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    username = user_in.username or _unique_username(db, user_in.email)
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    user = User(
        email=user_in.email,
        username=username,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role.value,
        is_active=user_in.is_active,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sin permisos")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_admin = current_user.role == "admin"
    if current_user.id != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Sin permisos")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = user_in.model_dump(exclude_unset=True)

    # Solo un admin puede cambiar rol o estado
    if not is_admin:
        data.pop("role", None)
        data.pop("is_active", None)
    # Un admin no puede quitarse a sí mismo el rol ni desactivarse
    if user.id == current_user.id:
        if data.get("role") not in (None, "admin") or data.get("is_active") is False:
            raise HTTPException(status_code=400, detail="No puedes cambiar tu propio rol ni desactivarte")

    if "email" in data and data["email"] != user.email:
        if db.query(User).filter(User.email == data["email"]).first():
            raise HTTPException(status_code=400, detail="El correo ya está registrado")

    password = data.pop("password", None)
    if password:
        user.hashed_password = get_password_hash(password)
    if "role" in data and data["role"] is not None:
        data["role"] = data["role"].value if hasattr(data["role"], "value") else data["role"]

    for field, value in data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/change-password")
def change_password(
    user_id: int,
    body: UserChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Sin permisos")
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    current_user.hashed_password = get_password_hash(body.new_password)
    db.commit()
    return {"message": "Contraseña actualizada"}


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado"}