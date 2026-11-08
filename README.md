# 🖥️ Sistema Backup AS/400
Proyecto educativo — SENA, Ficha 3186677 | 2026

Sistema web para la gestión y el registro de backups de journals AS/400 (IBM iSeries), con historial de operaciones, alertas automáticas, gestión de usuarios y configuración de conexiones.

---

## 📋 Tabla de Contenidos
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Prerrequisitos](#prerrequisitos)
- [Instalación y Setup](#instalación-y-setup)
- [Ejecución](#ejecución)
- [Datos de ejemplo](#datos-de-ejemplo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Roles de Usuario](#roles-de-usuario)
- [Autores](#autores)

---

## 📖 Descripción del Proyecto

**Sistema Backup AS/400** es una plataforma web diseñada para:

- 📊 **Panel de Control (Dashboard)** con indicadores: journals totales, journals activos, almacenamiento, usuarios registrados, gráfico de journals por tipo y actividad reciente
- 📂 **Gestionar journals** del AS/400 (nombre, biblioteca, tipo, estado, prioridad, tamaño, receptor actual) con buscador y operaciones de crear, editar y eliminar
- 🔄 **Historial de Backups**: registro de operaciones (backup completo, incremental y restauración) con resultado, tamaño, duración y responsable
- 🔗 **Relación Journals ↔ Historial**: cada operación se registra sobre un journal existente; un backup exitoso marca el journal como *respaldado*
- 🔔 **Alertas automáticas**: un backup fallido genera una alerta de forma automática
- ⚙️ **Configurar conexiones** AS/400 / DB2
- 👥 **Gestión de usuarios** con roles diferenciados (Administrador, Operador, DBA, Auditor)
- 🔐 **Autenticación JWT** con refresh tokens y recuperación de contraseña

> ℹ️ Las operaciones de backup se **registran** manualmente en el sistema; este proyecto no ejecuta backups reales sobre un AS/400.

---

## 🛠️ Stack Tecnológico

### Backend (`backend/`)
| Tecnología | Versión | Propósito |
|---|---|---|
| Python | 3.12+ | Lenguaje principal |
| FastAPI | 0.111.0 | Framework web async |
| SQLAlchemy | 2.0.30 | ORM para PostgreSQL |
| Pydantic | 2.7.1 | Validación de datos |
| python-jose | 3.3.0 | Tokens JWT |
| passlib + bcrypt | 1.7.4 / 4.0.1 | Hashing de contraseñas |
| uvicorn | 0.29.0 | Servidor ASGI |
| psycopg2 | 2.9.9 | Driver PostgreSQL |

### Frontend (`frontend/`)
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3+ | Interfaz de usuario |
| TypeScript | 5.4+ | Tipado estático |
| Vite | 5.3+ | Bundler y dev server |
| TailwindCSS | 3.4+ | Estilos utility-first |
| React Router | 6.23+ | Enrutamiento |
| Axios | 1.7+ | Cliente HTTP |
| Zustand | 4.5+ | Estado global |
| React Hook Form | 7.51+ | Manejo de formularios |
| Zod | 3.23+ | Validación de esquemas |
| Recharts | 2.12+ | Gráficas y visualizaciones |
| React Hot Toast | 2.4+ | Notificaciones toast |
| Lucide React | 0.383+ | Iconos |

### Base de Datos e Infraestructura
| Tecnología | Versión | Propósito |
|---|---|---|
| PostgreSQL | 16 | Base de datos relacional |
| Docker | 24+ | Contenedores |
| Docker Compose | 2.20+ | Orquestación de servicios |

---

## 🗄️ Estructura de la Base de Datos

### Tablas principales

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema con roles |
| `as400_connections` | Conexiones configuradas al AS/400 / DB2 |
| `journals` | Journals del AS/400 registrados en el sistema |
| `backups` | Historial de operaciones de backup / restauración |
| `alerts` | Alertas del sistema (errores, advertencias) |

### Tabla `users`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER (PK) | Identificador único |
| email | VARCHAR(255) | Correo electrónico (único) |
| username | VARCHAR(100) | Nombre de usuario (único) |
| full_name | VARCHAR(255) | Nombre completo |
| hashed_password | VARCHAR(255) | Contraseña hasheada (bcrypt) |
| role | VARCHAR(20) | `admin` / `operator` / `dba` / `auditor` |
| is_active | BOOLEAN | Estado de la cuenta |
| created_at | TIMESTAMP | Fecha de registro |

### Tabla `journals`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER (PK) | Identificador único |
| name | VARCHAR(255) | Nombre del journal (ej. QAUDJRN) |
| library | VARCHAR(255) | Biblioteca AS/400 (ej. QSYS) |
| type | VARCHAR(30) | `System` / `Audit` / `Application` / `Security` |
| status | VARCHAR(20) | `activo` / `respaldado` / `inactivo` |
| priority | VARCHAR(20) | `alta` / `media` / `baja` |
| size_mb | NUMERIC(12,1) | Tamaño en MB |
| current_receiver | VARCHAR(255) | Receptor actual (ej. RCVR0001) |
| as400_created_at | DATE | Fecha de creación en el AS/400 |
| description | TEXT | Notas del journal |

### Tabla `backups` (Historial)
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER (PK) | Identificador único |
| journal_name | VARCHAR(255) | Journal sobre el que se hizo la operación |
| operation_type | VARCHAR(30) | `Backup Completo` / `Backup Incremental` / `Restauracion` |
| result | VARCHAR(20) | `exitoso` / `fallido` |
| size_mb | NUMERIC(12,1) | Tamaño del respaldo en MB |
| duration_seconds | INTEGER | Duración en segundos |
| executed_by | VARCHAR(255) | Nombre de quien ejecutó la operación |
| notes | TEXT | Notas |
| created_by | FK → users | Usuario que registró la operación |
| created_at | TIMESTAMP | Fecha de la operación |

### Reglas de negocio
- Un backup **exitoso** (completo o incremental) cambia el journal de `activo` a `respaldado`.
- Un backup **fallido** crea automáticamente una alerta de tipo `backup_failed`.
- Las restauraciones y los backups fallidos **no** cambian el estado del journal.
- No se puede registrar una operación sobre un journal que no existe.

---

## ✅ Prerrequisitos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Python | 3.12+ | `python --version` |
| Node.js | 20 LTS+ | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Git | 2.40+ | `git --version` |

> ⚠️ **Importante:** Usar **pnpm** como gestor de paquetes de Node.js.

---

## 🚀 Instalación y Setup

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sistema-backup-as400
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@db:5432/backup_as400

# JWT
SECRET_KEY=supersecretkey-change-in-production-please

# App
DEBUG=true
FRONTEND_URL=http://localhost:5173

# Admin por defecto (se crea automáticamente)
FIRST_ADMIN_EMAIL=admin@sistema.com
FIRST_ADMIN_USERNAME=admin
FIRST_ADMIN_PASSWORD=Admin1234!
FIRST_ADMIN_FULLNAME=Administrador del Sistema
```

### 3. Levantar Backend y Base de Datos con Docker
```bash
docker compose up -d
```

Esto levanta automáticamente:
- 🐘 PostgreSQL con todas las tablas creadas
- 🐍 FastAPI con el usuario admin y los datos de ejemplo creados
- 📄 Script SQL inicial ejecutado

### 4. Instalar dependencias del Frontend
```bash
cd frontend
pnpm install
pnpm approve-builds
```

---

## ▶️ Ejecución

### Terminal 1 — Backend y Base de Datos
```bash
# Desde la raíz del proyecto
docker compose up -d

# Ver logs del backend
docker logs backup_as400_api -f

# Ver logs de la base de datos
docker logs backup_as400_db -f
```

### Terminal 2 — Frontend
```bash
cd frontend
pnpm dev
# → App en http://localhost:5173
```

### Verificar que todo funciona
```bash
# Backend API
curl http://localhost:8000/health
# Respuesta: {"status": "ok"}

# Documentación interactiva
# Abrir en navegador: http://localhost:8000/api/docs
```

---

## 🌐 URLs del Sistema

| Servicio | URL |
|---|---|
| Frontend (App web) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Documentación Swagger | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/api/redoc |

---

## 👤 Credenciales por defecto

| Campo | Valor |
|---|---|
| Email | admin@sistema.com |
| Contraseña | Admin1234! |
| Rol | Administrador |

---

## 🧪 Datos de ejemplo

Al iniciar por primera vez (base de datos vacía), el backend carga datos de demostración:

- **7 journals** (`@journal`, `AUDJRN02`, `QSYSJRN`, `QAUDJRN`, `APPJRN01`, `SECJRN01`, `APPJRN02`)
- **5 operaciones** en el Historial de Backups
- **6 usuarios** con roles Operador, DBA y Auditor

Todos los usuarios de ejemplo tienen la contraseña `Usuario123!` (por ejemplo `gcrespo@empresa.com`).

> ⚠️ Cambia o elimina estas cuentas antes de usar el sistema fuera de un entorno de pruebas.

Para reiniciar la base de datos desde cero (se vuelven a cargar los datos de ejemplo):
```bash
docker compose down -v
docker compose up -d
```

---

## 📁 Estructura del Proyecto

```
sistema-backup-as400/
│
├── backend/                        # API FastAPI + Python
│   ├── app/
│   │   ├── main.py                 # Punto de entrada FastAPI + datos de ejemplo
│   │   ├── core/
│   │   │   ├── config.py           # Configuración y variables de entorno
│   │   │   ├── database.py         # Conexión a PostgreSQL
│   │   │   └── security.py         # JWT + bcrypt
│   │   ├── models/                 # Modelos ORM (tablas)
│   │   │   ├── user.py
│   │   │   ├── journal.py
│   │   │   ├── backup.py
│   │   │   ├── alert.py
│   │   │   └── connection.py
│   │   ├── schemas/                # Validación Pydantic
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── journal.py
│   │   │   ├── backup.py
│   │   │   ├── alert.py
│   │   │   ├── connection.py
│   │   │   └── dashboard.py
│   │   ├── api/                    # Endpoints REST
│   │   │   ├── deps.py             # Dependencias (auth guards)
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── journals.py
│   │   │   ├── backups.py
│   │   │   ├── alerts.py
│   │   │   ├── connections.py
│   │   │   └── dashboard.py
│   │   ├── services/               # Lógica de negocio
│   │   └── utils/                  # Utilidades
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                       # App React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Componentes reutilizables
│   │   │   ├── ui/                 # Modal y menú de acciones (RowMenu)
│   │   │   └── layout/             # Layout principal con sidebar
│   │   ├── features/
│   │   │   ├── auth/               # Login, Registro, Recuperar contraseña
│   │   │   ├── dashboard/          # Panel de Control (KPIs y gráfica)
│   │   │   ├── journals/           # Gestión de journals
│   │   │   ├── history/            # Historial de backups
│   │   │   ├── alerts/             # Sistema de alertas
│   │   │   ├── settings/           # Configuración AS/400
│   │   │   └── users/              # Gestión de usuarios (solo Administrador)
│   │   ├── lib/
│   │   │   └── api.ts              # Cliente HTTP con interceptores JWT
│   │   ├── store/
│   │   │   └── index.ts            # Estado global (Zustand)
│   │   ├── types/
│   │   │   └── index.ts            # Tipos TypeScript
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx       # Rutas protegidas
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── .npmrc
│   └── Dockerfile
│
├── database/
│   └── init.sql                    # Script SQL inicial (tablas + índices)
│
├── docs/                           # Documentación del proyecto
├── docker-compose.yml              # Orquestación (BD + Backend)
├── .env                            # Variables de entorno
├── .gitignore
└── README.md
```

---

## 🔌 Endpoints de la API

**Base URL:** `http://localhost:8000/api/v1`

### Autenticación (`/auth`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuario (siempre con rol Auditor) | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Renovar access token | No |
| POST | `/auth/forgot-password` | Solicitar recuperación | No |
| POST | `/auth/reset-password` | Restablecer contraseña | No |
| GET | `/auth/me` | Obtener usuario actual | Sí |

### Journals (`/journals`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/journals?search=` | Listar y buscar journals | Sí |
| POST | `/journals` | Crear journal | Admin / Operador / DBA |
| GET | `/journals/{id}` | Ver journal | Sí |
| PATCH | `/journals/{id}` | Editar journal | Admin / Operador / DBA |
| DELETE | `/journals/{id}` | Eliminar journal | Admin / Operador / DBA |

### Historial de Backups (`/backups`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/backups?search=` | Historial de operaciones | Sí |
| POST | `/backups` | Registrar operación (actualiza el journal y crea alerta si falla) | Admin / Operador / DBA |
| GET | `/backups/{id}` | Ver operación | Sí |
| DELETE | `/backups/{id}` | Eliminar registro | Admin / Operador / DBA |

### Usuarios (`/users`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/users?search=` | Listar y buscar usuarios | Admin |
| POST | `/users` | Registrar usuario | Admin |
| GET | `/users/{id}` | Ver usuario | Admin o el mismo usuario |
| PATCH | `/users/{id}` | Editar usuario (rol, estado, contraseña) | Admin o el mismo usuario* |
| DELETE | `/users/{id}` | Eliminar usuario | Admin |

\* Solo un Administrador puede cambiar rol o estado. Nadie puede eliminarse ni desactivarse a sí mismo.

### Alertas (`/alerts`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/alerts` | Listar alertas | Sí |
| GET | `/alerts/unread-count` | Contador sin leer | Sí |
| PATCH | `/alerts/{id}/read` | Marcar como leída | Sí |
| PATCH | `/alerts/read-all` | Marcar todas leídas | Sí |
| PATCH | `/alerts/{id}/resolve` | Resolver alerta | Sí |

### Conexiones AS/400 (`/connections`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/connections` | Listar conexiones | Sí |
| POST | `/connections` | Crear conexión | Admin |
| PATCH | `/connections/{id}` | Editar conexión | Admin |
| POST | `/connections/{id}/test` | Probar conexión | Sí |
| DELETE | `/connections/{id}` | Eliminar conexión | Admin |

### Dashboard (`/dashboard`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/dashboard/stats` | Indicadores, journals por tipo y actividad reciente | Sí |

---

## 👥 Roles de Usuario

### Administrador (`admin`)
- Todo lo que pueden hacer los demás roles
- Gestión de usuarios (crear, editar, activar/desactivar, eliminar)
- Gestión de conexiones AS/400

### Operador (`operator`) y DBA (`dba`)
- Ver Dashboard, Journals, Historial y Alertas
- Crear, editar y eliminar journals
- Registrar operaciones en el Historial de Backups

### Auditor (`auditor`)
- Ver Dashboard, Journals, Historial y Alertas (solo lectura)
- Es el rol que reciben las cuentas creadas desde el registro público

---

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** — nunca en texto plano
- Autenticación con **JWT** (Access Token 60 min + Refresh Token 7 días)
- Renovación automática de tokens en el frontend
- Rutas protegidas por rol en el backend y en el frontend
- El registro público **no permite elegir el rol**: siempre crea cuentas de solo lectura
- **CORS** configurado solo para `http://localhost:5173`

---

## 🛑 Comandos útiles de Docker

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs del backend
docker logs backup_as400_api -f

# Ver logs de la base de datos
docker logs backup_as400_db -f

# Entrar a la base de datos
docker exec -it backup_as400_db psql -U postgres -d backup_as400

# Ver tablas
\dt

# Ver usuarios
SELECT id, email, role, is_active FROM users;

# Salir
\q

# Detener todo
docker compose down

# Detener y borrar volúmenes (reset completo)
docker compose down -v
```

---

## 👥 Autores

| Nombre | Rol |
|---|---|
| Guillermo Crespo | Desarrollador Full Stack |

**Programa:** SENA — Ficha 3186677