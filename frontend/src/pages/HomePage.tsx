import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  Bell,
  Users,
  Settings,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Check,
  AlertTriangle,
  Github,
  Lock,
  Server,
  Eye,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "../store";
import Logo from "../components/ui/Logo";

// ── Datos de las secciones ────────────────────────────────
const NAV_LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "caracteristicas", label: "Características" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "roles", label: "Roles" },
  { id: "contacto", label: "Contacto" },
];

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Panel de control",
    text: "Journals totales y activos, almacenamiento, usuarios, gráfica por tipo y la actividad reciente en una sola pantalla.",
  },
  {
    icon: BookOpen,
    title: "Gestión de journals",
    text: "Registra cada journal con su biblioteca, tipo, estado, prioridad, tamaño y receptor actual. Busca, edita y elimina.",
  },
  {
    icon: History,
    title: "Historial de backups",
    text: "Cada backup completo, incremental o restauración queda registrado con su resultado, tamaño, duración y responsable.",
  },
  {
    icon: Bell,
    title: "Alertas automáticas",
    text: "Si un backup falla, el sistema crea la alerta solo. Puedes marcarla como leída o resolverla.",
  },
  {
    icon: Users,
    title: "Usuarios y roles",
    text: "Cuatro roles con permisos distintos. El administrador crea, edita, activa o desactiva cuentas.",
  },
  {
    icon: Settings,
    title: "Conexiones AS/400",
    text: "Configura los datos de conexión a tus servidores AS/400 y DB2 desde un solo lugar.",
  },
];

const STEPS = [
  {
    title: "Registra tus journals",
    text: "Agrega los journals de tu AS/400 con su biblioteca, tipo y prioridad.",
  },
  {
    title: "Registra cada operación",
    text: "Anota el backup o la restauración sobre un journal existente, con su resultado y duración.",
  },
  {
    title: "El sistema se actualiza solo",
    text: "Un backup exitoso marca el journal como respaldado. Uno fallido genera una alerta.",
  },
  {
    title: "Revisa el panel",
    text: "Consulta el estado general, el historial y las alertas pendientes en cualquier momento.",
  },
];

const ROLES = [
  {
    name: "Administrador",
    tag: "admin",
    points: ["Gestiona usuarios y roles", "Configura conexiones AS/400", "Todo lo que hacen los demás roles"],
  },
  {
    name: "Operador",
    tag: "operator",
    points: ["Crea y edita journals", "Registra backups y restauraciones", "Consulta panel y alertas"],
  },
  {
    name: "DBA",
    tag: "dba",
    points: ["Crea y edita journals", "Registra backups y restauraciones", "Consulta panel y alertas"],
  },
  {
    name: "Auditor",
    tag: "auditor",
    points: ["Consulta panel, journals e historial", "Revisa las alertas", "Solo lectura, sin modificar datos"],
  },
];

const TECH = ["FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "JWT"];

// ── Utilidades ────────────────────────────────────────────
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Vista previa del sistema (datos de ejemplo) ───────────
function PreviewCard() {
  const rows = [
    { name: "QAUDJRN", lib: "QSYS", status: "activo", cls: "badge-success" },
    { name: "SECJRN01", lib: "QSYS", status: "respaldado", cls: "badge-info" },
    { name: "APPJRN02", lib: "TESTLIB", status: "inactivo", cls: "badge-pending" },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-brand-600/20 blur-3xl rounded-full" aria-hidden />
      <div className="relative card p-0 overflow-hidden shadow-2xl shadow-black/40">
        {/* Barra superior */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border bg-surface/60">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs text-slate-500 font-mono">Journals</span>
        </div>

        <div className="p-4 space-y-4">
          {/* Indicadores */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Journals", value: "7" },
              { label: "Activos", value: "5" },
              { label: "Almacenamiento", value: "3 GB" },
            ].map((k) => (
              <div key={k.label} className="rounded-lg bg-surface border border-surface-border px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{k.label}</p>
                <p className="text-lg font-semibold text-white">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="rounded-lg border border-surface-border overflow-hidden">
            {rows.map((r, i) => (
              <div
                key={r.name}
                className={`flex items-center justify-between px-3 py-2.5 text-sm ${
                  i > 0 ? "border-t border-surface-border" : ""
                }`}
              >
                <span className="font-mono text-slate-200">{r.name}</span>
                <span className="font-mono text-xs text-slate-500">{r.lib}</span>
                <span className={r.cls}>{r.status}</span>
              </div>
            ))}
          </div>

          {/* Alerta */}
          <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-300">Backup fallido: APPJRN01</p>
              <p className="text-xs text-slate-500">Alerta creada automáticamente</p>
            </div>
          </div>
        </div>
      </div>
      <p className="relative text-center text-xs text-slate-600 mt-3">Vista previa con datos de ejemplo</p>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────
export default function HomePage() {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <div className="min-h-screen bg-surface text-slate-100">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => go("inicio")} aria-label="Ir al inicio">
            <Logo size="sm" />
          </button>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                Ir al panel <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Iniciar sesión</Link>
                <Link to="/register" className="btn-primary">Registrarse</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-300"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menú móvil */}
        {open && (
          <div className="md:hidden border-t border-surface-border bg-surface px-4 py-4 space-y-1 animate-fade-in">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="block w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-surface-hover"
              >
                {l.label}
              </button>
            ))}
            <div className="flex gap-3 pt-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary flex-1 text-center">Ir al panel</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1 text-center">Iniciar sesión</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Inicio (hero) ── */}
      <section id="inicio" className="relative scroll-mt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.12]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-medium">
              <Server size={13} /> IBM iSeries · AS/400
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight text-white">
              Control y trazabilidad de los backups de tus journals
            </h1>
            <p className="mt-5 text-lg text-slate-400 max-w-xl">
              Registra cada journal y cada operación de respaldo en un solo sistema. Sabrás qué se respaldó,
              cuándo, quién lo hizo y qué falló.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                  Ir al panel <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                    Crear cuenta <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary px-6 py-3">Iniciar sesión</Link>
                </>
              )}
              <button onClick={() => go("caracteristicas")} className="px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors">
                Ver características
              </button>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { v: "4", l: "roles de usuario" },
                { v: "3", l: "tipos de operación" },
                { v: "Auto", l: "alertas por fallos" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-2xl font-bold text-white">{s.v}</dt>
                  <dd className="text-xs text-slate-500 mt-0.5">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-in">
            <PreviewCard />
          </div>
        </div>
      </section>

      {/* ── Sobre el proyecto ── */}
      <section className="border-y border-surface-border bg-surface-card/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-medium text-brand-400">Sobre el proyecto</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Un registro claro de lo que pasa con tus journals
            </h2>
          </div>
          <div className="space-y-4 text-slate-400">
            <p>
              Los journals del AS/400 guardan los cambios de tus datos, y respaldarlos bien es parte del trabajo
              diario. Este sistema te ayuda a llevar ese control: qué journals existen, cuál es su estado y qué
              operaciones se han hecho sobre ellos.
            </p>
            <p>
              Los backups se <span className="text-slate-200">registran</span> en el sistema: no se ejecutan sobre
              el servidor. Así tienes un historial confiable y alertas cuando algo sale mal.
            </p>
          </div>
        </div>
      </section>

      {/* ── Características ── */}
      <section id="caracteristicas" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-400">Características</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Todo lo que necesitas para llevar el control</h2>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card hover:border-brand-500/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center mb-4">
                <Icon size={20} className="text-brand-400" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="scroll-mt-20 border-y border-surface-border bg-surface-card/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-brand-400">Cómo funciona</p>
            <h2 className="mt-2 text-3xl font-bold text-white">De la operación a la alerta, en cuatro pasos</h2>
          </div>

          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative card">
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-400">Roles</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Cada persona ve y hace lo que le corresponde</h2>
          <p className="mt-3 text-slate-400">
            Las cuentas nuevas que se registran desde esta página empiezan como Auditor, con acceso de solo lectura.
            Un administrador puede cambiar el rol después.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ROLES.map((r) => (
            <div key={r.tag} className="card flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{r.name}</h3>
                {r.tag === "auditor" ? (
                  <Eye size={18} className="text-slate-500" />
                ) : r.tag === "admin" ? (
                  <ShieldCheck size={18} className="text-brand-400" />
                ) : (
                  <ClipboardList size={18} className="text-slate-500" />
                )}
              </div>
              <ul className="mt-4 space-y-2.5">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-400">
                    <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Seguridad y tecnología ── */}
      <section className="border-y border-surface-border bg-surface-card/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Lock size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Acceso protegido</h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                Inicio de sesión con token JWT, contraseñas cifradas con bcrypt y rutas protegidas por rol,
                tanto en la aplicación como en el servidor.
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Construido con</p>
            <div className="flex flex-wrap gap-2">
              {TECH.map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-sm text-slate-300 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Llamado final ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-600/25 to-surface-card px-6 py-12 text-center">
          <h2 className="text-3xl font-bold text-white">Empieza a llevar el control de tus backups</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Crea tu cuenta o inicia sesión para ver el panel, los journals y el historial.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                Ir al panel <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-6 py-3">Registrarse</Link>
                <Link to="/login" className="btn-secondary px-6 py-3">Iniciar sesión</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Contacto / pie ── */}
      <footer id="contacto" className="scroll-mt-20 border-t border-surface-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-10">
          <div>
            <Logo size="md" />
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              Sistema de gestión y backup de journals AS/400 IBM iSeries.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Navegación</h4>
            <ul className="mt-4 space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button onClick={() => go(l.id)} className="text-sm text-slate-500 hover:text-white transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Proyecto formativo</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>SENA · Ficha 3186677</li>
              <li>Desarrollado por Guillermo Crespo</li>
              <li>
                <a
                  href="https://github.com/crespo66-stack/sistema-backup-as400"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Github size={16} /> Ver el código en GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-border py-5 text-center text-xs text-slate-600">
          © 2026 AS/400 Backup · Proyecto educativo
        </div>
      </footer>
    </div>
  );
}