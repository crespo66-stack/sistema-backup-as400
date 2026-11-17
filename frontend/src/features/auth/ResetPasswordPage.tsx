import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "../../components/ui/Logo";
import toast from "react-hot-toast";
import { authApi } from "../../lib/api";

const schema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(token, data.password);
      toast.success("Contraseña actualizada. Inicia sesión.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="card">
          {!token ? (
            <div className="text-center py-2">
              <h2 className="text-lg font-semibold text-white mb-2">Enlace no válido</h2>
              <p className="text-slate-400 text-sm">
                Este enlace está incompleto. Solicita uno nuevo para recuperar tu contraseña.
              </p>
              <Link to="/forgot-password" className="btn-primary inline-flex mt-6">Solicitar enlace nuevo</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">Nueva contraseña</h2>
              <p className="text-slate-400 text-sm mb-6">Escribe la contraseña nueva para tu cuenta.</p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <p className="text-sm text-red-300">{error}</p>
                  <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">
                    Solicitar un enlace nuevo
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Contraseña nueva</label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      className="input pr-10"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
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

                <div>
                  <label className="label">Confirmar contraseña</label>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    className="input"
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Guardando..." : "Guardar contraseña"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}