import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { journalsApi } from "../../lib/api";
import { useAuthStore } from "../../store";
import type { Journal, JournalType, JournalStatus, JournalPriority } from "../../types";
import Modal from "../../components/ui/Modal";
import RowMenu from "../../components/ui/RowMenu";

const statusBadge: Record<string, string> = {
  activo: "badge-success",
  respaldado: "badge-info",
  inactivo: "badge-pending",
};
const priorityBadge: Record<string, string> = {
  alta: "badge-error",
  media: "badge-warning",
  baja: "badge-pending",
};

interface FormState {
  name: string;
  library: string;
  type: JournalType;
  status: JournalStatus;
  priority: JournalPriority;
  size_mb: string;
  current_receiver: string;
  as400_created_at: string;
  description: string;
}

const emptyForm: FormState = {
  name: "", library: "", type: "System", status: "activo", priority: "media",
  size_mb: "", current_receiver: "", as400_created_at: "", description: "",
};

export default function JournalsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canWrite = role === "admin" || role === "operator" || role === "dba";

  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Journal | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async (q = search) => {
    try {
      const { data } = await journalsApi.list(q.trim() ? { search: q.trim() } : undefined);
      setJournals(data);
    } catch {
      toast.error("No se pudieron cargar los journals");
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda con pequeña espera mientras se escribe
  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (j: Journal) => {
    setEditing(j);
    setForm({
      name: j.name,
      library: j.library,
      type: j.type,
      status: j.status,
      priority: j.priority,
      size_mb: String(j.size_mb ?? ""),
      current_receiver: j.current_receiver ?? "",
      as400_created_at: j.as400_created_at ?? "",
      description: j.description ?? "",
    });
    setModalOpen(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      library: form.library.trim(),
      type: form.type,
      status: form.status,
      priority: form.priority,
      size_mb: form.size_mb === "" ? 0 : Number(form.size_mb),
      current_receiver: form.current_receiver.trim() || null,
      as400_created_at: form.as400_created_at || null,
      description: form.description.trim() || null,
    };
    try {
      if (editing) {
        await journalsApi.update(editing.id, payload);
        toast.success("Journal actualizado");
      } else {
        await journalsApi.create(payload);
        toast.success("Journal creado");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (j: Journal) => {
    if (!window.confirm(`¿Eliminar el journal ${j.name}?`)) return;
    try {
      await journalsApi.delete(j.id);
      toast.success("Journal eliminado");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Journals</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de journals del sistema AS400</p>
        </div>
        {canWrite && (
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Nuevo Journal
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Buscar journals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : journals.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">No se encontraron journals</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-y border-surface-border">
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Biblioteca</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Prioridad</th>
                  <th className="text-left px-4 py-3 font-medium">Tamaño</th>
                  <th className="text-left px-4 py-3 font-medium">Receptor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {journals.map((j) => (
                  <tr key={j.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-200">{j.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{j.library}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-md border border-surface-border text-xs font-medium text-slate-200">
                        {j.type}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className={statusBadge[j.status]}>{j.status}</span></td>
                    <td className="px-4 py-3"><span className={priorityBadge[j.priority]}>{j.priority}</span></td>
                    <td className="px-4 py-3 text-slate-300">{j.size_mb} MB</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{j.current_receiver || "–"}</td>
                    <td className="px-4 py-3 text-right">
                      {canWrite && (
                        <RowMenu
                          items={[
                            { label: "Editar", onClick: () => openEdit(j) },
                            { label: "Eliminar", onClick: () => remove(j), danger: true },
                          ]}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editing ? "Editar Journal" : "Nuevo Journal"} onClose={() => setModalOpen(false)}>
          <form onSubmit={submit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre del Journal *</label>
              <input className="input" placeholder="QAUDJRN" required value={form.name}
                     onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className="label">Biblioteca *</label>
              <input className="input" placeholder="QSYS" required value={form.library}
                     onChange={(e) => set("library", e.target.value)} />
            </div>

            <div>
              <label className="label">Tipo *</label>
              <select className="input" value={form.type} onChange={(e) => set("type", e.target.value as JournalType)}>
                <option value="System">System</option>
                <option value="Audit">Audit</option>
                <option value="Application">Application</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.status} onChange={(e) => set("status", e.target.value as JournalStatus)}>
                <option value="activo">Activo</option>
                <option value="respaldado">Respaldado</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="label">Prioridad</label>
              <select className="input" value={form.priority} onChange={(e) => set("priority", e.target.value as JournalPriority)}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="label">Tamaño (MB)</label>
              <input className="input" type="number" min="0" step="0.1" placeholder="256.5" value={form.size_mb}
                     onChange={(e) => set("size_mb", e.target.value)} />
            </div>

            <div>
              <label className="label">Receptor Actual</label>
              <input className="input" placeholder="RCVR0001" value={form.current_receiver}
                     onChange={(e) => set("current_receiver", e.target.value)} />
            </div>
            <div>
              <label className="label">Fecha creación AS400</label>
              <input className="input" type="date" value={form.as400_created_at}
                     onChange={(e) => set("as400_created_at", e.target.value)} />
            </div>

            <div className="col-span-2">
              <label className="label">Descripción</label>
              <textarea className="input min-h-[80px]" placeholder="Notas sobre el journal..." value={form.description}
                        onChange={(e) => set("description", e.target.value)} />
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear Journal"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}