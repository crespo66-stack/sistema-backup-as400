from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class BackupStatus(str, Enum):
    pending   = "pending"
    running   = "running"
    completed = "completed"
    failed    = "failed"
    cancelled = "cancelled"


class BackupCreate(BaseModel):
    journal_id: int


class BackupResponse(BaseModel):
    id:              int
    journal_id:      int
    created_by:      int
    status:          BackupStatus
    receiver:        Optional[str]
    started_at:      Optional[datetime]
    completed_at:    Optional[datetime]
    file_path:       Optional[str]
    file_size_bytes: Optional[int]
    records_count:   Optional[int]
    error_message:   Optional[str]
    created_at:      datetime

    class Config:
        from_attributes = True