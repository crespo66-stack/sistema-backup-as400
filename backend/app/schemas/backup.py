from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

OperationType = Literal["Backup Completo", "Backup Incremental", "Restauracion"]
BackupResult  = Literal["exitoso", "fallido"]


class BackupCreate(BaseModel):
    journal_name:     str = Field(..., min_length=1, max_length=255)
    operation_type:   OperationType = "Backup Completo"
    result:           BackupResult = "exitoso"
    size_mb:          Optional[float] = Field(None, ge=0)
    duration_seconds: Optional[int] = Field(None, ge=0)
    executed_by:      Optional[str] = None
    notes:            Optional[str] = None


class BackupResponse(BaseModel):
    id:               int
    journal_name:     str
    operation_type:   str
    result:           str
    size_mb:          Optional[float]
    duration_seconds: Optional[int]
    executed_by:      Optional[str]
    notes:            Optional[str]
    created_at:       datetime

    class Config:
        from_attributes = True