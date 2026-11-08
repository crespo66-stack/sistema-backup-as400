export type UserRole = "admin" | "operator" | "dba" | "auditor";
export type AlertSeverity = "info" | "warning" | "error" | "critical";

export type JournalType = "System" | "Audit" | "Application" | "Security";
export type JournalStatus = "activo" | "respaldado" | "inactivo";
export type JournalPriority = "alta" | "media" | "baja";
export type OperationType = "Backup Completo" | "Backup Incremental" | "Restauracion";
export type BackupResult = "exitoso" | "fallido";

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Journal {
  id: number;
  name: string;
  library: string;
  type: JournalType;
  status: JournalStatus;
  priority: JournalPriority;
  size_mb: number;
  current_receiver?: string | null;
  as400_created_at?: string | null;
  description?: string | null;
  created_at: string;
}

// Historial de backups
export interface Backup {
  id: number;
  journal_name: string;
  operation_type: OperationType;
  result: BackupResult;
  size_mb?: number | null;
  duration_seconds?: number | null;
  executed_by?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_read: boolean;
  is_resolved: boolean;
  source?: string;
  backup_id?: number;
  created_at: string;
  resolved_at?: string;
}

export interface AS400Connection {
  id: number;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  library?: string;
  is_active: boolean;
  is_default: boolean;
  last_tested_at?: string;
  last_test_success?: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_journals: number;
  active_journals: number;
  total_storage_mb: number;
  total_users: number;
  journals_by_type: { type: string; count: number }[];
  recent_activity: Backup[];
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}