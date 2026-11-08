from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date

JournalType     = Literal["System", "Audit", "Application", "Security"]
JournalStatus   = Literal["activo", "respaldado", "inactivo"]
JournalPriority = Literal["alta", "media", "baja"]


class JournalCreate(BaseModel):
    name:             str = Field(..., min_length=1, max_length=255)
    library:          str = Field(..., min_length=1, max_length=255)
    type:             JournalType = "System"
    status:           JournalStatus = "activo"
    priority:         JournalPriority = "media"
    size_mb:          float = Field(0, ge=0)
    current_receiver: Optional[str] = None
    as400_created_at: Optional[date] = None
    description:      Optional[str] = None


class JournalUpdate(BaseModel):
    name:             Optional[str] = Field(None, min_length=1, max_length=255)
    library:          Optional[str] = Field(None, min_length=1, max_length=255)
    type:             Optional[JournalType] = None
    status:           Optional[JournalStatus] = None
    priority:         Optional[JournalPriority] = None
    size_mb:          Optional[float] = Field(None, ge=0)
    current_receiver: Optional[str] = None
    as400_created_at: Optional[date] = None
    description:      Optional[str] = None


class JournalResponse(BaseModel):
    id:               int
    name:             str
    library:          str
    type:             str
    status:           str
    priority:         str
    size_mb:          float
    current_receiver: Optional[str]
    as400_created_at: Optional[date]
    description:      Optional[str]
    created_at:       datetime

    class Config:
        from_attributes = True