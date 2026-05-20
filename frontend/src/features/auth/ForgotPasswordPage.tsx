import { useState } from "react";
import { Link } from "react-router-dom";
import { Database, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Error al enviar el correo");
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
        </div>
        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Correo enviado</h2>
              <p className="text-slate-400 text-sm">Si tu email existe, recibirás un enlace de recuperación.</p>
              <Link to="/login" className="btn-primary inline-flex mt-6">Volver al login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">Recuperar contraseña</h2>
              <p className="text-slate-400 text-sm mb-6">Ingresa tu email y te enviaremos un enlace de recuperación.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="email@empresa.com" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Enviando..." : "Enviar enlace"}
                </button>
              </form>
              <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mt-6 transition-colors">
                <ArrowLeft size={14} /> Volver al login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}