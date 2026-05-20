import { useEffect, useState } from "react";
import { Trash2, RefreshCw, Filter } from "lucide-react";
import { backupsApi } from "../../lib/api";
import type { Backup, BackupStatus } from "../../types";
import { format } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";

const statusBadge: Record<BackupStatus, string> = {
  completed: "badge-success",
  failed: "badge-error",
  running: "badge-warning",
  pending: "badge-pending",
  cancelled: "badge-info",
};

const statusLabel: Record<BackupStatus, string> = {
  completed: "Completado",
  failed: "Fallido",
  running: "En progreso",
  pending: "Pendiente",
  cancelled: "Cancelado",
};

export default function HistoryPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await backupsApi.list({ ...params, limit: 100 });
      setBackups(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este registro de backup?")) return;
    try {
      await backupsApi.delete(id);
      toast.success("Registro eliminado");
      load();
    } catch { toast.error("Error al eliminar"); }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de Backups</h1>
          <p className="text-slate-500 text-sm mt-1">{backups.length} registros encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input w-40"
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="failed">Fallidos</option>
            <option value="running">En progreso</option>
            <option value="pending">Pendientes</option>
          </select>
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : backups.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No hay registros de backup</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-border">
                <tr className="text-slate-500">
                  <th className="text-left px-6 py-4 font-medium">ID</th>
                  <th className="text-left px-6 py-4 font-medium">Journal</th>
                  <th className="text-left px-6 py-4 font-medium">Estado</th>
                  <th className="text-left px-6 py-4 font-medium">Registros</th>
                  <th className="text-left px-6 py-4 font-medium">Tamaño</th>
                  <th className="text-left px-6 py-4 font-medium">Inicio</th>
                  <th className="text-left px-6 py-4 font-medium">Fin</th>
                  <th className="text-left px-6 py-4 font-medium">Duración</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {backups.map((b) => {
                  const duration = b.started_at && b.completed_at
                    ? Math.round((new Date(b.completed_at).getTime() - new Date(b.started_at).getTime()) / 1000)
                    : null;
                  return (
                    <tr key={b.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400">#{b.id}</td>
                      <td className="px-6 py-4 text-slate-300">#{b.journal_id}</td>
                      <td className="px-6 py-4">
                        <span className={statusBadge[b.status]}>{statusLabel[b.status]}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{b.records_count?.toLocaleString() ?? "-"}</td>
                      <td className="px-6 py-4 text-slate-400">{formatSize(b.file_size_bytes)}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {b.started_at ? format(new Date(b.started_at), "dd/MM/yy HH:mm") : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {b.completed_at ? format(new Date(b.completed_at), "dd/MM/yy HH:mm") : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {duration !== null ? `${duration}s` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {b.error_message && (
                          <span className="text-xs text-red-400 mr-2" title={b.error_message}>⚠ Error</span>
                        )}
                        <button onClick={() => handleDelete(b.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}