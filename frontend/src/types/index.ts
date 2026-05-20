export type UserRole = "admin" | "operator" | "viewer";
export type BackupStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type AlertSeverity = "info" | "warning" | "error" | "critical";

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
  description?: string;
  library: string;
  journal_name: string;
  connection_id: number;
  owner_id: number;
  is_active: boolean;
  schedule_cron?: string;
  retention_days: number;
  created_at: string;
  updated_at?: string;
}

export interface Backup {
  id: number;
  journal_id: number;
  created_by: number;
  status: BackupStatus;
  started_at?: string;
  completed_at?: string;
  file_path?: string;
  file_size_bytes?: number;
  records_count?: number;
  error_message?: string;
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
  total_backups: number;
  successful_backups: number;
  failed_backups: number;
  pending_alerts: number;
  last_backup_at?: string;
  success_rate: number;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}