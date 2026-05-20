from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models import AS400Connection, User
from app.schemas import ConnectionCreate, ConnectionUpdate, ConnectionResponse
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/connections", tags=["Conexiones AS/400"])


@router.get("/", response_model=List[ConnectionResponse])
def list_connections(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(AS400Connection).all()


@router.post("/", response_model=ConnectionResponse, status_code=201)
def create_connection(
    conn_in: ConnectionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    # If set as default, unset others
    if conn_in.is_default:
        db.query(AS400Connection).update({"is_default": False})

    conn = AS400Connection(
        name=conn_in.name,
        host=conn_in.host,
        port=conn_in.port,
        database=conn_in.database,
        username=conn_in.username,
        password_encrypted=conn_in.password,  # TODO: encrypt in production
        library=conn_in.library,
        is_default=conn_in.is_default,
    )
    db.add(conn)
    db.commit()
    db.refresh(conn)
    return conn


@router.get("/{conn_id}", response_model=ConnectionResponse)
def get_connection(
    conn_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    conn = db.query(AS400Connection).filter(AS400Connection.id == conn_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Conexión no encontrada")
    return conn


@router.patch("/{conn_id}", response_model=ConnectionResponse)
def update_connection(
    conn_id: int,
    conn_in: ConnectionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    conn = db.query(AS400Connection).filter(AS400Connection.id == conn_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Conexión no encontrada")

    if conn_in.is_default:
        db.query(AS400Connection).update({"is_default": False})

    for field, value in conn_in.model_dump(exclude_unset=True).items():
        if field == "password":
            conn.password_encrypted = value
        else:
            setattr(conn, field, value)
    db.commit()
    db.refresh(conn)
    return conn


@router.post("/{conn_id}/test")
def test_connection(
    conn_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    conn = db.query(AS400Connection).filter(AS400Connection.id == conn_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Conexión no encontrada")

    # TODO: Real DB2/AS400 connection test
    success = True
    conn.last_tested_at = datetime.utcnow()
    conn.last_test_success = success
    db.commit()
    return {"success": success, "message": "Conexión exitosa (simulada)"}


@router.delete("/{conn_id}")
def delete_connection(
    conn_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    conn = db.query(AS400Connection).filter(AS400Connection.id == conn_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Conexión no encontrada")
    db.delete(conn)
    db.commit()
    return {"message": "Conexión eliminada"}