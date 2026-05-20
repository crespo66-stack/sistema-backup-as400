import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Database, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
            <Database size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AS/400 Backup</h1>
          <p className="text-slate-500 text-sm mt-1">Sistema de respaldo empresarial</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@empresa.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}