from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models import Backup, Journal, User, BackupStatus
from app.schemas import BackupCreate, BackupResponse
from app.api.deps import get_current_user, require_operator

router = APIRouter(prefix="/backups", tags=["Backups"])


@router.get("/", response_model=List[BackupResponse])
def list_backups(
    skip: int = 0,
    limit: int = 50,
    journal_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Backup).order_by(desc(Backup.created_at))
    if journal_id:
        query = query.filter(Backup.journal_id == journal_id)
    if status:
        query = query.filter(Backup.status == status)
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=BackupResponse, status_code=201)
def create_backup(
    backup_in: BackupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator),
):
    journal = db.query(Journal).filter(Journal.id == backup_in.journal_id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal no encontrado")

    backup = Backup(
        journal_id=backup_in.journal_id,
        created_by=current_user.id,
        status=BackupStatus.pending,
    )
    db.add(backup)
    db.commit()
    db.refresh(backup)

    # Simulate start (in production, you'd trigger a background task)
    backup.status = BackupStatus.running
    backup.started_at = datetime.utcnow()
    db.commit()
    db.refresh(backup)

    return backup


@router.get("/{backup_id}", response_model=BackupResponse)
def get_backup(
    backup_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup no encontrado")
    return backup


@router.post("/{backup_id}/complete")
def complete_backup(
    backup_id: int,
    records_count: int = 0,
    db: Session = Depends(get_db),
    _: User = Depends(require_operator),
):
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup no encontrado")

    backup.status = BackupStatus.completed
    backup.completed_at = datetime.utcnow()
    backup.records_count = records_count
    db.commit()
    return {"message": "Backup completado"}


@router.post("/{backup_id}/fail")
def fail_backup(
    backup_id: int,
    error_message: str = "Error desconocido",
    db: Session = Depends(get_db),
    _: User = Depends(require_operator),
):
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup no encontrado")

    backup.status = BackupStatus.failed
    backup.completed_at = datetime.utcnow()
    backup.error_message = error_message
    db.commit()
    return {"message": "Backup marcado como fallido"}


@router.delete("/{backup_id}")
def delete_backup(
    backup_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_operator),
):
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Backup no encontrado")
    db.delete(backup)
    db.commit()
    return {"message": "Backup eliminado"}