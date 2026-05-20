import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Play, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { journalsApi, backupsApi, connectionsApi } from "../../lib/api";
import type { Journal, AS400Connection } from "../../types";
import { format } from "date-fns";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  description: z.string().optional(),
  library: z.string().min(1, "Requerido"),
  journal_name: z.string().min(1, "Requerido"),
  connection_id: z.coerce.number().min(1, "Selecciona una conexión"),
  schedule_cron: z.string().optional(),
  retention_days: z.coerce.number().min(1).default(30),
});
type FormData = z.infer<typeof schema>;

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [connections, setConnections] = useState<AS400Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Journal | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = async () => {
    try {
      const [j, c] = await Promise.all([journalsApi.list(), connectionsApi.list()]);
      setJournals(j.data);
      setConnections(c.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (j: Journal) => {
    setEditing(j);
    reset({ name: j.name, description: j.description ?? "", library: j.library, journal_name: j.journal_name, connection_id: j.connection_id, schedule_cron: j.schedule_cron ?? "", retention_days: j.retention_days });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await journalsApi.update(editing.id, data);
        toast.success("Journal actualizado");
      } else {
        await journalsApi.create(data);
        toast.success("Journal creado");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error al guardar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este journal?")) return;
    try {
      await journalsApi.delete(id);
      toast.success("Journal eliminado");
      load();
    } catch { toast.error("Error al eliminar"); }
  };

  const handleToggle = async (j: Journal) => {
    try {
      await journalsApi.update(j.id, { is_active: !j.is_active });
      toast.success(`Journal ${j.is_active ? "desactivado" : "activado"}`);
      load();
    } catch { toast.error("Error"); }
  };

  const handleRunBackup = async (journalId: number) => {
    try {
      await backupsApi.create(journalId);
      toast.success("Backup iniciado");
    } catch { toast.error("Error al iniciar backup"); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Journals</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona los journals de AS/400</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo Journal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : journals.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-500">No hay journals registrados.</p>
          <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2"><Plus size={16} /> Crear primero</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {journals.map((j) => (
            <div key={j.id} className="card group hover:border-brand-600/50 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{j.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{j.library}/{j.journal_name}</p>
                </div>
                <span className={j.is_active ? "badge-success" : "badge-pending"}>
                  {j.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
              {j.description && <p className="text-sm text-slate-400 mb-3 line-clamp-2">{j.description}</p>}
              <div className="text-xs text-slate-500 space-y-1 mb-4">
                <p>Retención: {j.retention_days} días</p>
                {j.schedule_cron && <p className="font-mono">Cron: {j.schedule_cron}</p>}
                <p>Creado: {format(new Date(j.created_at), "dd/MM/yyyy")}</p>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
                <button onClick={() => handleRunBackup(j.id)} className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5">
                  <Play size={12} /> Backup
                </button>
                <button onClick={() => openEdit(j)} className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => handleToggle(j)} className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5">
                  {j.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                </button>
                <button onClick={() => handleDelete(j.id)} className="btn-danger flex items-center gap-1 text-xs px-3 py-1.5 ml-auto">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-lg mx-4 animate-slide-up shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-6">
              {editing ? "Editar Journal" : "Nuevo Journal"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Nombre</label>
                  <input {...register("name")} className="input" placeholder="Mi Journal" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Library</label>
                  <input {...register("library")} className="input font-mono" placeholder="QSYS" />
                  {errors.library && <p className="text-red-400 text-xs mt-1">{errors.library.message}</p>}
                </div>
                <div>
                  <label className="label">Journal Name</label>
                  <input {...register("journal_name")} className="input font-mono" placeholder="QAUDJRN" />
                  {errors.journal_name && <p className="text-red-400 text-xs mt-1">{errors.journal_name.message}</p>}
                </div>
                <div>
                  <label className="label">Conexión AS/400</label>
                  <select {...register("connection_id")} className="input">
                    <option value="">Selecciona...</option>
                    {connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.connection_id && <p className="text-red-400 text-xs mt-1">{errors.connection_id.message}</p>}
                </div>
                <div>
                  <label className="label">Retención (días)</label>
                  <input {...register("retention_days")} type="number" className="input" defaultValue={30} />
                </div>
                <div className="col-span-2">
                  <label className="label">Schedule Cron (opcional)</label>
                  <input {...register("schedule_cron")} className="input font-mono" placeholder="0 2 * * *" />
                </div>
                <div className="col-span-2">
                  <label className="label">Descripción (opcional)</label>
                  <textarea {...register("description")} className="input h-20 resize-none" placeholder="Descripción del journal..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}