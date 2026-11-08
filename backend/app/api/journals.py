from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.core.database import get_db
from app.models import Journal, User
from app.schemas import JournalCreate, JournalUpdate, JournalResponse
from app.api.deps import get_current_user, require_operator

router = APIRouter(prefix="/journals", tags=["Journals"])


@router.get("/", response_model=List[JournalResponse])
def list_journals(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Journal)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(
            Journal.name.ilike(like),
            Journal.library.ilike(like),
            Journal.type.ilike(like),
            Journal.current_receiver.ilike(like),
        ))
    return query.order_by(Journal.id.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=JournalResponse, status_code=201)
def create_journal(
    journal_in: JournalCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_operator),
):
    journal = Journal(**journal_in.model_dump())
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal


@router.get("/{journal_id}", response_model=JournalResponse)
def get_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    journal = db.query(Journal).filter(Journal.id == journal_id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal no encontrado")
    return journal


@router.patch("/{journal_id}", response_model=JournalResponse)
def update_journal(
    journal_id: int,
    journal_in: JournalUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_operator),
):
    journal = db.query(Journal).filter(Journal.id == journal_id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal no encontrado")
    for field, value in journal_in.model_dump(exclude_unset=True).items():
        setattr(journal, field, value)
    db.commit()
    db.refresh(journal)
    return journal


@router.delete("/{journal_id}")
def delete_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_operator),
):
    journal = db.query(Journal).filter(Journal.id == journal_id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal no encontrado")
    db.delete(journal)
    db.commit()
    return {"message": "Journal eliminado"}