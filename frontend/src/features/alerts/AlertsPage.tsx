import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, ShieldCheck, RefreshCw } from "lucide-react";
import { alertsApi } from "../../lib/api";
import type { Alert } from "../../types";
import { format } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";

const severityBadge: Record<string, string> = {
  info: "badge-info",
  warning: "badge-warning",
  error: "badge-error",
  critical: "badge-error",
};

const severityLabel: Record<string, string> = {
  info: "Info",
  warning: "Advertencia",
  error: "Error",
  critical: "Crítico",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await alertsApi.list({ unread_only: unreadOnly, limit: 100 });
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [unreadOnly]);

  const markAllRead = async () => {
    await alertsApi.markAllRead();
    toast.success("Todas marcadas como leídas");
    load();
  };

  const resolve = async (id: number) => {
    await alertsApi.resolve(id);
    toast.success("Alerta resuelta");
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar alerta?")) return;
    await alertsApi.delete(id);
    toast.success("Alerta eliminada");
    load();
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Alertas
            {unreadCount > 0 && (
              <span className="badge-error text-xs">{unreadCount} sin leer</span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{alerts.length} alertas totales</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={e => setUnreadOnly(e.target.checked)}
              className="accent-brand-500"
            />
            Solo no leídas
          </label>
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={14} /> Marcar todas
          </button>
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={40} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">No hay alertas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={clsx(
                "card flex items-start gap-4 transition-all duration-200",
                !a.is_read && "border-brand-600/40 bg-brand-950/20"
              )}
            >
              <div className={clsx("w-2 h-2 rounded-full flex-shrink-0 mt-2", {
                "bg-blue-400": a.severity === "info",
                "bg-amber-400": a.severity === "warning",
                "bg-red-400": a.severity === "error" || a.severity === "critical",
              })} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={severityBadge[a.severity] ?? "badge-info"}>{severityLabel[a.severity]}</span>
                  {a.is_resolved && <span className="badge-success">Resuelta</span>}
                  {!a.is_read && <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />}
                </div>
                <h3 className="font-medium text-white text-sm">{a.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{a.message}</p>
                {a.source && <p className="text-xs text-slate-600 mt-1">Fuente: {a.source}</p>}
                <p className="text-xs text-slate-600 mt-2">{format(new Date(a.created_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {!a.is_resolved && (
                  <button onClick={() => resolve(a.id)} className="btn-secondary flex items-center gap-1 text-xs px-2 py-1">
                    <ShieldCheck size={12} /> Resolver
                  </button>
                )}
                <button onClick={() => remove(a.id)} className="btn-danger flex items-center gap-1 text-xs px-2 py-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}