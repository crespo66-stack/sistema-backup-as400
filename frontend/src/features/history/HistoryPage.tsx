import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { backupsApi, journalsApi } from "../../lib/api";
import { useAuthStore } from "../../store";
import type { Backup, Journal, OperationType, BackupResult } from "../../types";
import Modal from "../../components/ui/Modal";

const resultBadge: Record<string, string> = {
  exitoso: "badge-success",
  fallido: "badge-error",
};

interface FormState {
  journal_name: string;
  operation_type: OperationType;
  result: BackupResult;
  size_mb: string;
  duration_seconds: string;
  executed_by: string;
  notes: string;
}

const emptyForm: FormState = {
  journal_name: "",
  operation_type: "Backup Completo",
  result: "exitoso",
  size_mb: "",
  duration_seconds: "",
  executed_by: "",
  notes: "",
};

export default function HistoryPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === "admin" || role === "operator" || role === "dba";

  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);

  const load = async (q = search) => {
    try {
      const { data } = await backupsApi.list(q.trim() ? { search: q.trim() } : undefined);
      setBackups(data);
    } catch {
      toast.error("No se pudo cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda con pequeña espera mientras se escribe
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = async () => {
    setForm(emptyForm);
    setModalOpen(true);
    try {
      const { data } = await journalsApi.list();
      setJournals(data);
    } catch {
      toast.error("No se pudo cargar la lista de journals");
    }
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      journal_name: form.journal_name.trim(),
      operation_type: form.operation_type,
      result: form.result,
      size_mb: form.size_mb === "" ? null : Number(form.size_mb),
      duration_seconds: form.duration_seconds === "" ? null : Number(form.duration_seconds),
      executed_by: form.executed_by.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      await backupsApi.create(payload);
      toast.success("Operación registrada");
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Error al registrar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de Backups</h1>
          <p className="text-slate-500 text-sm mt-1">Registro de operaciones de respaldo</p>
        </div>
        {canWrite && (
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Registrar Operación
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">No se encontraron operaciones</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-y border-surface-border">
                  <th className="text-left px-4 py-3 font-medium">Journal</th>
                  <th className="text-left px-4 py-3 font-medium">Operación</th>
                  <th className="text-left px-4 py-3 font-medium">Resultado</th>
                  <th className="text-left px-4 py-3 font-medium">Tamaño</th>
                  <th className="text-left px-4 py-3 font-medium">Duración</th>
                  <th className="text-left px-4 py-3 font-medium">Ejecutado por</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-200">{b.journal_name}</td>
                    <td className="px-4 py-3 text-slate-300">{b.operation_type}</td>
                    <td className="px-4 py-3">
                      <span className={resultBadge[b.result] ?? "badge-info"}>{b.result}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{b.size_mb != null ? `${b.size_mb} MB` : "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{b.duration_seconds != null ? `${b.duration_seconds}s` : "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{b.executed_by || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {format(new Date(b.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title="Registrar Operación de Backup" onClose={() => setModalOpen(false)}>
          <form onSubmit={submit} className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <label className="label">Nombre Journal *</label>
              <select className="input" required value={form.journal_name}
                      onChange={(e) => set("journal_name", e.target.value)}>
                <option value="">Selecciona un journal...</option>
                {journals.map((j) => (
                  <option key={j.id} value={j.name}>{j.name} ({j.library})</option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="label">Tipo Operación *</label>
              <select className="input" value={form.operation_type}
                      onChange={(e) => set("operation_type", e.target.value as OperationType)}>
                <option value="Backup Completo">Backup Completo</option>
                <option value="Backup Incremental">Backup Incremental</option>
                <option value="Restauracion">Restauracion</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="label">Resultado</label>
              <select className="input" value={form.result}
                      onChange={(e) => set("result", e.target.value as BackupResult)}>
                <option value="exitoso">Exitoso</option>
                <option value="fallido">Fallido</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Tamaño (MB)</label>
              <input className="input" type="number" min="0" step="0.1" value={form.size_mb}
                     onChange={(e) => set("size_mb", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Duración (seg)</label>
              <input className="input" type="number" min="0" step="1" value={form.duration_seconds}
                     onChange={(e) => set("duration_seconds", e.target.value)} />
            </div>

            <div className="col-span-6">
              <label className="label">Ejecutado por</label>
              <input className="input" placeholder="Nombre del operador" value={form.executed_by}
                     onChange={(e) => set("executed_by", e.target.value)} />
            </div>

            <div className="col-span-6">
              <label className="label">Notas</label>
              <textarea className="input min-h-[80px]" value={form.notes}
                        onChange={(e) => set("notes", e.target.value)} />
            </div>

            <div className="col-span-6 flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}