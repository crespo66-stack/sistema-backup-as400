from pydantic import BaseModel
from typing import List

from app.schemas.backup import BackupResponse


class JournalTypeCount(BaseModel):
    type:  str
    count: int


class DashboardStats(BaseModel):
    total_journals:   int      # Journals totales
    active_journals:  int      # Journals activos
    total_storage_mb: float    # Almacenamiento (suma de tamaños)
    total_users:      int      # Usuarios registrados
    journals_by_type: List[JournalTypeCount]   # Gráfico "Journals por Tipo"
    recent_activity:  List[BackupResponse]     # "Actividad Reciente" (últimas 5)