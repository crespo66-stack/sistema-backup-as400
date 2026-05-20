import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, History, Bell,
  Settings, Users, LogOut, Menu, X, Database, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store";
import clsx from "clsx";

const navItems = [
  { to: "/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
  { to: "/journals",     label: "Journals",    icon: BookOpen },
  { to: "/history",      label: "Historial",   icon: History },
  { to: "/alerts",       label: "Alertas",     icon: Bell },
  { to: "/settings",     label: "Configuración", icon: Settings },
];

const adminItems = [
  { to: "/users", label: "Usuarios", icon: Users },
];

export default function DefaultLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside
        className={clsx(
          "flex flex-col bg-surface-card border-r border-surface-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
          <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Database size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">AS/400 Backup</p>
              <p className="text-xs text-slate-500 truncate">Sistema de respaldo</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive(to)
                  ? "bg-brand-600/20 text-brand-400"
                  : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
              {sidebarOpen && isActive(to) && (
                <ChevronRight size={14} className="ml-auto text-brand-400" />
              )}
            </Link>
          ))}

          {user?.role === "admin" && (
            <>
              {sidebarOpen && (
                <p className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Admin
                </p>
              )}
              {adminItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive(to)
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-surface-border p-3 space-y-1">
          {sidebarOpen && user && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-200 truncate">{user.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-card">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">v1.0.0</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}