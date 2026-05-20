-- ============================================================
-- Sistema Backup AS/400 - Script inicial PostgreSQL
-- Este script corre automáticamente al iniciar el contenedor
-- de postgres por primera vez (docker-entrypoint-initdb.d)
-- ============================================================

-- Extensión para UUIDs (opcional, para futuros usos)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tipos ENUM ─────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'operator', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE backup_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE alert_type AS ENUM ('backup_failed', 'journal_inactive', 'connection_error', 'db2_error', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tabla: users ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    email               VARCHAR(255) UNIQUE NOT NULL,
    username            VARCHAR(100) UNIQUE NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    hashed_password     VARCHAR(255) NOT NULL,
    role                user_role DEFAULT 'operator' NOT NULL,
    is_active           BOOLEAN DEFAULT TRUE,
    is_verified         BOOLEAN DEFAULT FALSE,
    avatar_url          VARCHAR(500),
    reset_token         VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE
);

-- ── Tabla: as400_connections ───────────────────────────────
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
CREATE TABLE IF NOT EXISTS journals (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    library             VARCHAR(255) NOT NULL,
    journal_name        VARCHAR(255) NOT NULL,
    connection_id       INTEGER NOT NULL REFERENCES as400_connections(id) ON DELETE RESTRICT,
    owner_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_active           BOOLEAN DEFAULT TRUE,
    schedule_cron       VARCHAR(100),
    retention_days      INTEGER DEFAULT 30,
    last_backup_at      TIMESTAMP WITH TIME ZONE,
    last_backup_status  VARCHAR(50),
    extra_config        JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE
);

-- ── Tabla: backups ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS backups (
    id                  SERIAL PRIMARY KEY,
    journal_id          INTEGER NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    created_by          INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status              backup_status DEFAULT 'pending' NOT NULL,
    receiver            VARCHAR(255),
    started_at          TIMESTAMP WITH TIME ZONE,
    completed_at        TIMESTAMP WITH TIME ZONE,
    file_path           VARCHAR(500),
    file_size_bytes     BIGINT,
    records_count       INTEGER,
    error_message       TEXT,
    backup_metadata     JSONB,
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
CREATE INDEX IF NOT EXISTS idx_backups_journal_id  ON backups(journal_id);
CREATE INDEX IF NOT EXISTS idx_backups_status      ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_created_at  ON backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read      ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_severity     ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_journals_is_active  ON journals(is_active);

-- ── Datos de ejemplo (opcionales) ─────────────────────────
-- Nota: el usuario admin lo crea el backend automáticamente al iniciar.
-- Aquí solo se agregan datos de demo para desarrollo.

INSERT INTO alerts (title, message, severity, type, source) VALUES
    ('Sistema iniciado', 'El sistema de backup AS/400 fue iniciado correctamente.', 'info', 'system', 'sistema'),
    ('Configuración pendiente', 'No hay conexiones AS/400 configuradas. Ve a Configuración.', 'warning', 'system', 'sistema')
ON CONFLICT DO NOTHING;