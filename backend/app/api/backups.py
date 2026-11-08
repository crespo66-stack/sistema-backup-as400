from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional

from app.core.database import get_db
from app.models import Alert, AlertSeverity, AlertType, Backup, Journal, User
from app.schemas import BackupCreate, BackupResponse
from app.api.deps import get_current_user, require_operator

router = APIRouter(prefix="/backups", tags=["Historial de Backups"])


@router.get("/", response_model=List[BackupResponse])
def list_backups(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Backup)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(
            Backup.journal_name.ilike(like),
            Backup.operation_type.ilike(like),
            Backup.result.ilike(like),
            Backup.executed_by.ilike(like),
        ))
    return query.order_by(desc(Backup.created_at), desc(Backup.id)).offset(skip).limit(limit).all()


@router.post("/", response_model=BackupResponse, status_code=201)
def create_backup(
    backup_in: BackupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator),
):
    data = backup_in.model_dump()

    # El journal debe existir en la sección Journals
    journals = db.query(Journal).filter(func.lower(Journal.name) == data["journal_name"].strip().lower()).all()
    if not journals:
        raise HTTPException(
            status_code=400,
            detail=f"El journal '{data['journal_name']}' no existe. Créalo primero en Journals.",
        )
    data["journal_name"] = journals[0].name

    # Si no escriben "Ejecutado por", se usa el usuario que está registrando
    if not data.get("executed_by"):
        data["executed_by"] = current_user.full_name

    # Un backup exitoso marca el journal como "respaldado" (si estaba activo).
    # Las restauraciones y los backups fallidos no cambian su estado.
    if data["result"] == "exitoso" and data["operation_type"] in ("Backup Completo", "Backup Incremental"):
        for j in journals:
            if j.status == "activo":
                j.status = "respaldado"

    backup = Backup(**data, created_by=current_user.id)
    db.add(backup)
    db.flush()  # para obtener backup.id

    # Un backup fallido genera una alerta automática en la sección Alertas
    if data["result"] == "fallido":
        detalle = f" Notas: {data['notes']}" if data.get("notes") else ""
        db.add(Alert(
            title=f"Backup fallido: {data['journal_name']}",
            message=(
                f"La operación «{data['operation_type']}» del journal {data['journal_name']} falló. "
                f"Registrada por {data['executed_by']}.{detalle}"
            ),
            severity=AlertSeverity.error,
            type=AlertType.backup_failed,
            source="Historial de Backups",
            backup_id=backup.id,
        ))

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
        raise HTTPException(status_code=404, detail="Operación no encontrada")
    return backup


@router.delete("/{backup_id}")
def delete_backup(
    backup_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_operator),
):
    backup = db.query(Backup).filter(Backup.id == backup_id).first()
    if not backup:
        raise HTTPException(status_code=404, detail="Operación no encontrada")
    db.delete(backup)
    db.commit()
    return {"message": "Operación eliminada"}