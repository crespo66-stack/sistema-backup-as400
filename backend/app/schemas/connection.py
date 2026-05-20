from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ConnectionCreate(BaseModel):
    name:       str = Field(..., min_length=2)
    host:       str
    port:       int = 446
    database:   str
    username:   str
    password:   str
    library:    Optional[str] = None
    is_default: bool = False


class ConnectionUpdate(BaseModel):
    name:       Optional[str]  = None
    host:       Optional[str]  = None
    port:       Optional[int]  = None
    database:   Optional[str]  = None
    username:   Optional[str]  = None
    password:   Optional[str]  = None
    library:    Optional[str]  = None
    is_active:  Optional[bool] = None
    is_default: Optional[bool] = None


class ConnectionResponse(BaseModel):
    id:                int
    name:              str
    host:              str
    port:              int
    database:          str
    username:          str
    library:           Optional[str]
    is_active:         bool
    is_default:        bool
    last_tested_at:    Optional[datetime]
    last_test_success: Optional[bool]
    created_at:        datetime

    class Config:
        from_attributes = True