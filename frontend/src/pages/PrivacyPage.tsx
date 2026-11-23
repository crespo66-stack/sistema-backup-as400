import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/ui/Logo";

const SECTIONS = [
  {
    title: "1. Quién trata tus datos",
    body: [
      "Este sistema (Sistema Backup AS/400) es un proyecto con fines académicos y de demostración. Quien lo administra es su desarrollador, y es el responsable del tratamiento de los datos que se registran aquí.",
      "Para cualquier solicitud sobre tus datos puedes escribir a sistembackupas@gmail.com.",
    ],
  },
  {
    title: "2. Qué datos recogemos",
    body: [
      "Al crear una cuenta guardamos tu nombre completo, tu nombre de usuario, tu correo electrónico y tu contraseña. La contraseña se guarda cifrada (bcrypt), por lo que nadie puede leerla.",
      "También se guarda la información que registras dentro del sistema (journals, backups, alertas) y las acciones básicas de tu cuenta, como el rol asignado y si está activa.",
    ],
  },
  {
    title: "3. Para qué los usamos",
    body: [
      "Usamos tus datos únicamente para crear tu cuenta, permitirte iniciar sesión, mostrarte la información del sistema según tu rol y enviarte el correo de recuperación de contraseña cuando lo solicites.",
      "No vendemos tus datos, no los usamos para publicidad y no los compartimos con terceros para fines comerciales.",
    ],
  },
  {
    title: "4. Autorización",
    body: [
      "Al marcar la casilla de aceptación en el registro autorizas el tratamiento de tus datos para las finalidades descritas, de acuerdo con la Ley 1581 de 2012 de Colombia sobre protección de datos personales. Puedes revocar esa autorización en cualquier momento.",
    ],
  },
  {
    title: "5. Dónde se guardan",
    body: [
      "Los datos se almacenan en servicios de nube: la base de datos en Supabase, el servidor en Render y la página web en Vercel. El correo de recuperación se envía mediante Brevo. Estos servicios pueden tener sus servidores fuera de Colombia.",
    ],
  },
  {
    title: "6. Cookies y almacenamiento en el navegador",
    body: [
      "El sistema no usa cookies de publicidad ni de rastreo. Solo guarda en tu navegador los datos de tu sesión (para que no tengas que iniciar sesión en cada página). Se eliminan cuando cierras sesión.",
    ],
  },
  {
    title: "7. Tus derechos",
    body: [
      "Como titular de los datos puedes conocerlos, actualizarlos, rectificarlos, pedir que se eliminen, revocar tu autorización y consultar el uso que se les ha dado.",
      "Para ejercer estos derechos escribe a sistembackupas@gmail.com indicando el correo con el que te registraste. Atenderemos tu solicitud dentro de los plazos que fija la ley.",
    ],
  },
  {
    title: "8. Recomendación de uso",
    body: [
      "Como este es un proyecto de demostración, te pedimos no registrar información personal sensible ni datos reales de sistemas en producción.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface text-slate-100">
      <header className="border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Ir al inicio">
            <Logo size="sm" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white">Política de privacidad</h1>
        <p className="mt-2 text-sm text-slate-500">Última actualización: noviembre de 2026</p>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-white">{s.title}</h2>
              <div className="mt-2 space-y-3 text-slate-400 leading-relaxed">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}