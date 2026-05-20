import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Database, BookOpen, CheckCircle, XCircle, Bell, TrendingUp, Clock } from "lucide-react";
import { dashboardApi, backupsApi } from "../../lib/api";
import type { DashboardStats, Backup } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import clsx from "clsx";

const statusBadge: Record<string, string> = {
  completed: "badge-success",
  failed: "badge-error",
  running: "badge-warning",
  pending: "badge-pending",
  cancelled: "badge-info",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBackups, setRecentBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, b] = await Promise.all([
          dashboardApi.stats(),
          backupsApi.list({ limit: 8 }),
        ]);
        setStats(s.data);
        setRecentBackups(b.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = [
    { name: "Exitosos", value: stats?.successful_backups ?? 0, fill: "#10b981" },
    { name: "Fallidos", value: stats?.failed_backups ?? 0, fill: "#ef4444" },
    { name: "Journals", value: stats?.total_journals ?? 0, fill: "#6366f1" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen del sistema de backup AS/400</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Journals" value={stats?.total_journals ?? 0} sub={`${stats?.active_journals ?? 0} activos`} color="text-brand-400" />
        <StatCard icon={CheckCircle} label="Backups Exitosos" value={stats?.successful_backups ?? 0} sub={`${stats?.success_rate ?? 0}% tasa de éxito`} color="text-emerald-400" />
        <StatCard icon={XCircle} label="Backups Fallidos" value={stats?.failed_backups ?? 0} sub="Requieren atención" color="text-red-400" />
        <StatCard icon={Bell} label="Alertas Pendientes" value={stats?.pending_alerts ?? 0} sub="Sin leer" color="text-amber-400" />
      </div>

      {/* Chart + Last backup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Resumen de operaciones</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Clock size={14} /> Último backup
          </h3>
          {stats?.last_backup_at ? (
            <div>
              <p className="text-2xl font-bold text-white">
                {format(new Date(stats.last_backup_at), "HH:mm", { locale: es })}
              </p>
              <p className="text-slate-500 text-sm">
                {format(new Date(stats.last_backup_at), "dd MMM yyyy", { locale: es })}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-sm text-emerald-400">Sistema operativo</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Sin backups registrados</p>
          )}
        </div>
      </div>

      {/* Recent backups */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Backups recientes</h3>
        {recentBackups.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No hay backups registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-surface-border">
                  <th className="text-left pb-3 font-medium">ID</th>
                  <th className="text-left pb-3 font-medium">Journal</th>
                  <th className="text-left pb-3 font-medium">Estado</th>
                  <th className="text-left pb-3 font-medium">Registros</th>
                  <th className="text-left pb-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentBackups.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3 text-slate-400 font-mono">#{b.id}</td>
                    <td className="py-3 text-slate-300">Journal #{b.journal_id}</td>
                    <td className="py-3">
                      <span className={statusBadge[b.status] ?? "badge-info"}>{b.status}</span>
                    </td>
                    <td className="py-3 text-slate-400">{b.records_count ?? "-"}</td>
                    <td className="py-3 text-slate-400">
                      {format(new Date(b.created_at), "dd/MM/yy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: number; sub: string; color: string;
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx("p-2.5 rounded-lg bg-current/10 flex-shrink-0", color)}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  );
}