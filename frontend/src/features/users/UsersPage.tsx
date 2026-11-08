import { useEffect, useState } from "react";
import { Plus, Search, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usersApi } from "../../lib/api";
import { useAuthStore } from "../../store";
import type { User, UserRole } from "../../types";
import Modal from "../../components/ui/Modal";
import RowMenu from "../../components/ui/RowMenu";
import type { RowMenuItem } from "../../components/ui/RowMenu";

const roleLabel: Record<UserRole, string> = {
  admin: "Administrador",
  operator: "Operador",
  dba: "DBA",
  auditor: "Auditor",
};

const roleStyle: Record<UserRole, string> = {
  admin: "bg-red-500/15 text-red-400 border-red-500/30",
  operator: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  dba: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  auditor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

interface FormState {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

const emptyForm: FormState = {
  full_name: "", email: "", password: "", role: "operator", is_active: true,
};

export default function UsersPage() {
  const me = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async (q = search) => {
    try {
      const { data } = await usersApi.list(q.trim() ? { search: q.trim() } : undefined);
      setUsers(data);
    } catch {
      toast.error("No se pudieron cargar los usuarios");
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

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ full_name: u.full_name, email: u.email, password: "", role: u.role, is_active: u.is_active });
    setModalOpen(true);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const errorMsg = (err: any, fallback: string) => {
    const d = err.response?.data?.detail;
    return (Array.isArray(d) ? d[0]?.msg : d) || fallback;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload: any = {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          role: form.role,
          is_active: form.is_active,
        };
        if (form.password) payload.password = form.password;
        await usersApi.update(editing.id, payload);
        toast.success("Usuario actualizado");
      } else {
        await usersApi.create({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          is_active: form.is_active,
        });
        toast.success("Usuario registrado");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(errorMsg(err, "Error al guardar"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: User) => {
    try {
      await usersApi.update(u.id, { is_active: !u.is_active });
      toast.success(u.is_active ? "Usuario desactivado" : "Usuario activado");
      load();
    } catch (err: any) {
      toast.error(errorMsg(err, "No se pudo cambiar el estado"));
    }
  };

  const remove = async (u: User) => {
    if (!window.confirm(`¿Eliminar al usuario ${u.full_name}?`)) return;
    try {
      await usersApi.delete(u.id);
      toast.success("Usuario eliminado");
      load();
    } catch (err: any) {
      toast.error(errorMsg(err, "Error al eliminar"));
    }
  };

  const menuItems = (u: User) => {
    const items: RowMenuItem[] = [{ label: "Editar", onClick: () => openEdit(u) }];
    // No se puede desactivar ni eliminar la propia cuenta
    if (u.id !== me?.id) {
      items.push({ label: u.is_active ? "Desactivar" : "Activar", onClick: () => toggleActive(u) });
      items.push({ label: "Eliminar", onClick: () => remove(u), danger: true });
    }
    return items;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios del Sistema</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de cuentas de usuario</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">No se encontraron usuarios</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-y border-surface-border">
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Correo</th>
                  <th className="text-left px-4 py-3 font-medium">Rol</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Registrado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${roleStyle[u.role]}`}>
                        <Shield size={11} /> {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.is_active ? "badge-success" : "badge-pending"}>
                        {u.is_active ? "activo" : "inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {format(new Date(u.created_at), "d MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowMenu items={menuItems(u)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editing ? "Editar Usuario" : "Registrar Usuario"} onClose={() => setModalOpen(false)}>
          <form onSubmit={submit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre completo *</label>
              <input className="input" placeholder="Nombre del usuario" required minLength={2} value={form.full_name}
                     onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Correo electrónico *</label>
              <input className="input" type="email" placeholder="usuario@empresa.com" required value={form.email}
                     onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">{editing ? "Contraseña (dejar vacío para no cambiarla)" : "Contraseña *"}</label>
              <input className="input" type="password" placeholder="Mínimo 8 caracteres"
                     required={!editing} minLength={8} value={form.password}
                     onChange={(e) => set("password", e.target.value)} />
            </div>
            <div>
              <label className="label">Rol *</label>
              <select className="input" value={form.role} onChange={(e) => set("role", e.target.value as UserRole)}>
                <option value="operator">Operador</option>
                <option value="dba">DBA</option>
                <option value="auditor">Auditor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.is_active ? "1" : "0"}
                      onChange={(e) => set("is_active", e.target.value === "1")}>
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Registrar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}