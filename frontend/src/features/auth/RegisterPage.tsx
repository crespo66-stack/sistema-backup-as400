import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Database, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../lib/api";

const schema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "Mínimo 3 caracteres"),
  full_name: z.string().min(2, "Nombre requerido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.register({
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        password: data.password,
      });
      toast.success("Cuenta creada. Inicia sesión.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
            <Database size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AS/400 Backup</h1>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Crear cuenta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Usuario</label>
                <input {...register("username")} className="input" placeholder="jdoe" />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
              </div>
              <div>
                <label className="label">Nombre completo</label>
                <input {...register("full_name")} className="input" placeholder="John Doe" />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register("email")} type="email" className="input" placeholder="email@empresa.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input {...register("confirmPassword")} type="password" className="input" placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}