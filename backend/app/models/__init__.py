# Importar Base primero
from app.core.database import Base  # noqa: F401

# Importar modelos en orden (respetando foreign keys)
from app.models.user       import User, UserRole        # noqa: F401
from app.models.connection import AS400Connection       # noqa: F401
from app.models.journal    import Journal               # noqa: F401
from app.models.backup     import Backup, BackupStatus  # noqa: F401
from app.models.alert      import Alert, AlertSeverity, AlertType  # noqa: F401