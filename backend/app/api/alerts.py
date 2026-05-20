from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models import Alert, User, AlertSeverity
from app.schemas import AlertResponse
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/alerts", tags=["Alertas"])


@router.get("/", response_model=List[AlertResponse])
def list_alerts(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Alert).order_by(desc(Alert.created_at))
    if unread_only:
        query = query.filter(Alert.is_read == False)
    return query.offset(skip).limit(limit).all()


@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    count = db.query(Alert).filter(Alert.is_read == False).count()
    return {"count": count}


@router.patch("/{alert_id}/read")
def mark_read(
    alert_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    alert.is_read = True
    db.commit()
    return {"message": "Alerta marcada como leída"}


@router.patch("/read-all")
def mark_all_read(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "Todas las alertas marcadas como leídas"}


@router.patch("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    alert.is_resolved = True
    alert.is_read = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Alerta resuelta"}


@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    db.delete(alert)
    db.commit()
    return {"message": "Alerta eliminada"}