import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wifi, WifiOff, Star, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { connectionsApi } from "../../lib/api";
import type { AS400Connection } from "../../types";
import { format } from "date-fns";

const schema = z.object({
  name: z.string().min(2),
  host: z.string().min(1, "Requerido"),
  port: z.coerce.number().default(446),
  database: z.string().min(1, "Requerido"),
  username: z.string().min(1, "Requerido"),
  password: z.string().min(1, "Requerido"),
  library: z.string().optional(),
  is_default: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const [connections, setConnections] = useState<AS400Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AS400Connection | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = async () => {
    try {
      const { data } = await connectionsApi.list();
      setConnections(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); reset({ port: 446, is_default: false }); setModalOpen(true); };
  const openEdit = (c: AS400Connection) => {
    setEditing(c);
    reset({ name: c.name, host: c.host, port: c.port, database: c.database, username: c.username, password: "", library: c.library ?? "", is_default: c.is_default });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await connectionsApi.update(editing.id, data);
        toast.success("Conexión actualizada");
      } else {
        await connectionsApi.create(data);
        toast.success("Conexión creada");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error al guardar");
    }
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      const { data } = await connectionsApi.test(id);
      toast.success(data.message);
      load();
    } catch { toast.error("Falló la prueba de conexión"); }
    finally { setTestingId(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta conexión?")) return;
    try {
      await connectionsApi.delete(id);
      toast.success("Conexión eliminada");
      load();
    } catch { toast.error("Error al eliminar"); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-slate-500 text-sm mt-1">Conexiones AS/400 / DB2</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nueva Conexión
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : connections.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-500">No hay conexiones configuradas</p>
          <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2"><Plus size={16} /> Agregar conexión</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {connections.map((c) => (
            <div key={c.id} className="card hover:border-brand-600/40 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{c.name}</h3>
                  {c.is_default && <Star size={14} className="text-amber-400" fill="currentColor" />}
                </div>
                <div className="flex items-center gap-1">
                  {c.last_tested_at && (
                    c.last_test_success
                      ? <span className="badge-success"><Wifi size={10} /> OK</span>
                      : <span className="badge-error"><WifiOff size={10} /> Error</span>
                  )}
                  <span className={c.is_active ? "badge-success" : "badge-pending"}>
                    {c.is_active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500 font-mono space-y-1 mb-4">
                <p>{c.host}:{c.port}</p>
                <p>DB: {c.database} | User: {c.username}</p>
                {c.library && <p>Library: {c.library}</p>}
                {c.last_tested_at && <p>Probado: {format(new Date(c.last_tested_at), "dd/MM/yy HH:mm")}</p>}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
                <button
                  onClick={() => handleTest(c.id)}
                  disabled={testingId === c.id}
                  className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5"
                >
                  {testingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Wifi size={12} />}
                  Probar
                </button>
                <button onClick={() => openEdit(c)} className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={() => handleDelete(c.id)} className="btn-danger flex items-center gap-1 text-xs px-3 py-1.5 ml-auto">
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
              {editing ? "Editar Conexión" : "Nueva Conexión AS/400"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input {...register("name")} className="input" placeholder="Producción AS/400" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label">Host / IP</label>
                  <input {...register("host")} className="input font-mono" placeholder="192.168.1.100" />
                  {errors.host && <p className="text-red-400 text-xs mt-1">{errors.host.message}</p>}
                </div>
                <div>
                  <label className="label">Puerto</label>
                  <input {...register("port")} type="number" className="input font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Base de datos</label>
                  <input {...register("database")} className="input font-mono" placeholder="*LOCAL" />
                </div>
                <div>
                  <label className="label">Library</label>
                  <input {...register("library")} className="input font-mono" placeholder="QSYS" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Usuario</label>
                  <input {...register("username")} className="input" placeholder="QSECOFR" />
                </div>
                <div>
                  <label className="label">Contraseña</label>
                  <input {...register("password")} type="password" className="input" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input {...register("is_default")} type="checkbox" id="is_default" className="accent-brand-500" />
                <label htmlFor="is_default" className="text-sm text-slate-400 cursor-pointer">Establecer como conexión predeterminada</label>
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