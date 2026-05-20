from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas import UserResponse, UserCreate, UserUpdate, UserChangePassword
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(User).offset(skip).limit(limit).all()


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
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
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sin permisos")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    for field, value in user_in.model_dump(exclude_unset=True).items():
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
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado"}