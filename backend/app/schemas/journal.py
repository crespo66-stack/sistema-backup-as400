from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class JournalCreate(BaseModel):
    name:           str = Field(..., min_length=2)
    description:    Optional[str] = None
    library:        str
    journal_name:   str
    connection_id:  int
    schedule_cron:  Optional[str] = None
    retention_days: int = 30
    extra_config:   Optional[dict] = None


class JournalUpdate(BaseModel):
    name:           Optional[str]  = None
    description:    Optional[str]  = None
    library:        Optional[str]  = None
    journal_name:   Optional[str]  = None
    connection_id:  Optional[int]  = None
    is_active:      Optional[bool] = None
    schedule_cron:  Optional[str]  = None
    retention_days: Optional[int]  = None
    extra_config:   Optional[dict] = None


class JournalResponse(BaseModel):
    id:                 int
    name:               str
    description:        Optional[str]
    library:            str
    journal_name:       str
    connection_id:      int
    owner_id:           int
    is_active:          bool
    schedule_cron:      Optional[str]
    retention_days:     int
    last_backup_at:     Optional[datetime]
    last_backup_status: Optional[str]
    created_at:         datetime
    updated_at:         Optional[datetime]

    class Config:
        from_attributes = True