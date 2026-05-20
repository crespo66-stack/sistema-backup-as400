# 🖥️ Sistema Backup AS/400
Proyecto educativo — SENA, Ficha 3171599 | 2026

Sistema web para la gestión y monitoreo de backups de journals AS/400 con DB2, incluyendo historial, alertas y configuración de conexiones JDBC.

---

## 📋 Tabla de Contenidos
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Prerrequisitos](#prerrequisitos)
- [Instalación y Setup](#instalación-y-setup)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Roles de Usuario](#roles-de-usuario)
- [Autores](#autores)

---

## 📖 Descripción del Proyecto

**Sistema Backup AS/400** es una plataforma web empresarial diseñada para:

- 📂 **Gestionar journals** de AS/400 con operaciones CRUD completas
- 🔄 **Ejecutar y monitorear backups** de forma manual o programada
- 📊 **Dashboard administrativo** con KPIs en tiempo real
- 🔔 **Sistema de alertas** para backups fallidos, errores de conexión y journals inactivos
- ⚙️ **Configurar conexiones** AS/400 / DB2 de forma segura
- 👥 **Gestión de usuarios** con roles diferenciados (Admin, Operador, Viewer)
- 🔐 **Autenticación JWT** con refresh tokens y recuperación de contraseña

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
| `journals` | Journals registrados para backup |
| `backups` | Historial completo de backups ejecutados |
| `alerts` | Alertas del sistema (errores, advertencias) |

### Tabla `users`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER (PK) | Identificador único |
| email | VARCHAR(255) | Correo electrónico (único) |
| username | VARCHAR(100) | Nombre de usuario (único) |
| full_name | VARCHAR(255) | Nombre completo |
| hashed_password | VARCHAR(255) | Contraseña hasheada |
| role | ENUM | admin / operator / viewer |
| is_active | BOOLEAN | Estado de la cuenta |

### Tabla `journals`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER (PK) | Identificador único |
| name | VARCHAR(255) | Nombre del journal |
| library | VARCHAR(255) | Library AS/400 |
| journal_name | VARCHAR(255) | Nombre del journal en AS/400 |
| connection_id | FK | Conexión AS/400 asociada |
| is_active | BOOLEAN | Estado del journal |
| schedule_cron | VARCHAR(100) | Programación automática |
| retention_days | INTEGER | Días de retención del backup |

### Tabla `backups`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER (PK) | Identificador único |
| journal_id | FK | Journal asociado |
| status | ENUM | pending/running/completed/failed/cancelled |
| receiver | VARCHAR(255) | Receiver del backup AS/400 |
| started_at | TIMESTAMP | Inicio del backup |
| completed_at | TIMESTAMP | Fin del backup |
| records_count | INTEGER | Registros procesados |
| error_message | TEXT | Mensaje de error si falló |

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
- 🐍 FastAPI con el usuario admin creado
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

## 📁 Estructura del Proyecto

```
sistema-backup-as400/
│
├── backend/                        # API FastAPI + Python
│   ├── app/
│   │   ├── main.py                 # Punto de entrada FastAPI
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
│   │   │   └── layout/             # Layout principal con sidebar
│   │   ├── features/
│   │   │   ├── auth/               # Login, Registro, Recuperar contraseña
│   │   │   ├── dashboard/          # KPIs y gráficas
│   │   │   ├── journals/           # CRUD journals
│   │   │   ├── history/            # Historial de backups
│   │   │   ├── alerts/             # Sistema de alertas
│   │   │   └── settings/           # Configuración AS/400
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
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Renovar access token | No |
| POST | `/auth/forgot-password` | Solicitar recuperación | No |
| POST | `/auth/reset-password` | Restablecer contraseña | No |
| GET | `/auth/me` | Obtener usuario actual | Sí |

### Journals (`/journals`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/journals` | Listar journals | Sí |
| POST | `/journals` | Crear journal | Sí |
| GET | `/journals/{id}` | Ver journal | Sí |
| PATCH | `/journals/{id}` | Editar journal | Sí |
| DELETE | `/journals/{id}` | Eliminar journal | Sí |

### Backups (`/backups`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/backups` | Historial de backups | Sí |
| POST | `/backups` | Iniciar backup | Sí |
| GET | `/backups/{id}` | Ver backup | Sí |
| DELETE | `/backups/{id}` | Eliminar registro | Sí |

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
| GET | `/dashboard/stats` | KPIs del sistema | Sí |

---

## 👥 Roles de Usuario

### Admin
- CRUD completo de journals
- Gestión de conexiones AS/400
- Ver y gestionar alertas
- Ver historial de backups
- Gestión de usuarios

### Operator
- Ver dashboard
- Ver y ejecutar backups
- Ver historial
- Ver alertas

### Viewer
- Ver dashboard
- Ver historial
- Ver alertas (solo lectura)

---

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** — nunca en texto plano
- Autenticación con **JWT** (Access Token 60 min + Refresh Token 7 días)
- Renovación automática de tokens en el frontend
- Rutas protegidas por rol en el backend
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
| Eriks | Desarrollador Full Stack |

**Programa:** SENA — Ficha 3171599
**Fecha:** 2026