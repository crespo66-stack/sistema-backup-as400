import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Database, ShieldCheck, HardDrive, Users, CheckCircle2, XCircle } from "lucide-react";
import { dashboardApi } from "../../lib/api";
import type { DashboardStats } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const operationLabel: Record<string, string> = {
  "Backup Completo": "Backup completo",
  "Backup Incremental": "Backup incremental",
  "Restauracion": "Restauración",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = (stats?.journals_by_type ?? []).map((t) => ({ name: t.type, value: t.count }));
  const maxCount = Math.max(4, ...chartData.map((d) => d.value));

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-slate-500 text-sm mt-1">
          Sistema de Gestión y Backup de Journals AS400 IBM iSeries
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Journals totales" value={String(stats?.total_journals ?? 0)} />
        <StatCard icon={ShieldCheck} label="Journals activos" value={String(stats?.active_journals ?? 0)} />
        <StatCard icon={HardDrive} label="Almacenamiento" value={`${stats?.total_storage_mb ?? 0} MB`} />
        <StatCard icon={Users} label="Usuarios registrados" value={String(stats?.total_users ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Journals por tipo */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Journals por Tipo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={56}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                allowDecimals={false}
                domain={[0, maxCount]}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(v: number) => [v, "Journals"]}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Actividad reciente */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Actividad Reciente</h3>
          {(stats?.recent_activity.length ?? 0) === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">Sin actividad registrada</p>
          ) : (
            <ul className="space-y-4">
              {stats!.recent_activity.map((b) => {
                const ok = b.result === "exitoso";
                return (
                  <li key={b.id} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {operationLabel[b.operation_type] ?? b.operation_type} — {b.journal_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {b.executed_by ?? "—"} · {format(new Date(b.created_at), "d MMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                    <span className="text-xs text-slate-300 border border-surface-border rounded-md px-2 py-0.5 flex-shrink-0">
                      {b.size_mb != null ? `${b.size_mb} MB` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className="p-2.5 rounded-lg bg-brand-600/15 text-brand-400 flex-shrink-0">
        <Icon size={18} />
      </div>
    </div>
  );
}