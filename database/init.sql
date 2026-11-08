-- ============================================================
-- Sistema Backup AS/400 - Script inicial PostgreSQL
-- Este script corre automáticamente al iniciar el contenedor
-- de postgres por primera vez (docker-entrypoint-initdb.d)
-- ============================================================

-- Extensión para UUIDs (opcional, para futuros usos)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tipos ENUM ─────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE alert_type AS ENUM ('backup_failed', 'journal_inactive', 'connection_error', 'db2_error', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tabla: users ───────────────────────────────────────────
-- role: admin | operator | dba | auditor
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    email               VARCHAR(255) UNIQUE NOT NULL,
    username            VARCHAR(100) UNIQUE NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    hashed_password     VARCHAR(255) NOT NULL,
    role                VARCHAR(20) DEFAULT 'operator' NOT NULL,
    is_active           BOOLEAN DEFAULT TRUE,
    is_verified         BOOLEAN DEFAULT FALSE,
    avatar_url          VARCHAR(500),
    reset_token         VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE
);

-- ── Tabla: as400_connections (Configuración) ───────────────
CREATE TABLE IF NOT EXISTS as400_connections (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    host                VARCHAR(255) NOT NULL,
    port                INTEGER DEFAULT 446,
    database            VARCHAR(255) NOT NULL,
    username            VARCHAR(255) NOT NULL,
    password_encrypted  TEXT NOT NULL,
    library             VARCHAR(255),
    is_active           BOOLEAN DEFAULT TRUE,
    is_default          BOOLEAN DEFAULT FALSE,
    last_tested_at      TIMESTAMP WITH TIME ZONE,
    last_test_success   BOOLEAN,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE
);

-- ── Tabla: journals ────────────────────────────────────────
-- type:     System | Audit | Application | Security
-- status:   activo | respaldado | inactivo
-- priority: alta | media | baja
CREATE TABLE IF NOT EXISTS journals (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    library             VARCHAR(255) NOT NULL,
    type                VARCHAR(30)  DEFAULT 'System' NOT NULL,
    status              VARCHAR(20)  DEFAULT 'activo' NOT NULL,
    priority            VARCHAR(20)  DEFAULT 'media'  NOT NULL,
    size_mb             NUMERIC(12,1) DEFAULT 0 NOT NULL,
    current_receiver    VARCHAR(255),
    as400_created_at    DATE,
    description         TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE
);

-- ── Tabla: backups (Historial de Backups) ──────────────────
-- operation_type: Backup Completo | Backup Incremental | Restauracion
-- result:         exitoso | fallido
CREATE TABLE IF NOT EXISTS backups (
    id                  SERIAL PRIMARY KEY,
    journal_name        VARCHAR(255) NOT NULL,
    operation_type      VARCHAR(30)  DEFAULT 'Backup Completo' NOT NULL,
    result              VARCHAR(20)  DEFAULT 'exitoso' NOT NULL,
    size_mb             NUMERIC(12,1),
    duration_seconds    INTEGER,
    executed_by         VARCHAR(255),
    notes               TEXT,
    created_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Tabla: alerts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    severity    alert_severity DEFAULT 'info' NOT NULL,
    type        alert_type DEFAULT 'system' NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    source      VARCHAR(100),
    backup_id   INTEGER REFERENCES backups(id) ON DELETE SET NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ── Índices para performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_backups_journal_name ON backups(journal_name);
CREATE INDEX IF NOT EXISTS idx_backups_result      ON backups(result);
CREATE INDEX IF NOT EXISTS idx_backups_created_at  ON backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read      ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_severity     ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_journals_status     ON journals(status);

-- ── Datos de ejemplo (opcionales) ─────────────────────────
-- Nota: el usuario admin lo crea el backend automáticamente al iniciar.
-- Aquí solo se agregan datos de demo para desarrollo.

INSERT INTO alerts (title, message, severity, type, source) VALUES
    ('Sistema iniciado', 'El sistema de backup AS/400 fue iniciado correctamente.', 'info', 'system', 'sistema'),
    ('Configuración pendiente', 'No hay conexiones AS/400 configuradas. Ve a Configuración.', 'warning', 'system', 'sistema')
ON CONFLICT DO NOTHING;