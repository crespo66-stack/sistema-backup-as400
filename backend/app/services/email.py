"""Envío de correos (recuperación de contraseña) por SMTP."""
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from html import escape

from app.core.config import settings


def email_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD)


def _build_message(to_email: str, full_name: str, reset_link: str) -> EmailMessage:
    sender = settings.SMTP_FROM or settings.SMTP_USER
    minutes = settings.RESET_TOKEN_MINUTES
    name = full_name or "usuario"

    msg = EmailMessage()
    msg["Subject"] = "Recupera tu contraseña — AS400 Backup"
    msg["From"] = formataddr(("AS400 Backup", sender))
    msg["To"] = to_email

    msg.set_content(
        f"Hola {name},\n\n"
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta en AS400 Backup.\n\n"
        f"Abre este enlace para crear una contraseña nueva (vence en {minutes} minutos):\n"
        f"{reset_link}\n\n"
        "Si tú no hiciste esta solicitud, ignora este correo: tu contraseña no cambiará.\n"
    )

    safe_name = escape(name)
    safe_link = escape(reset_link, quote=True)
    msg.add_alternative(
        f"""\
<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0"
               style="max-width:480px;background:#141414;border:1px solid #262626;border-radius:12px;">
          <tr><td style="padding:32px;color:#e5e5e5;">
            <p style="margin:0 0 4px;font-size:13px;letter-spacing:4px;color:#ffffff;font-weight:bold;">AS400</p>
            <h1 style="margin:16px 0 12px;font-size:20px;color:#ffffff;">Recupera tu contraseña</h1>
            <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#a3a3a3;">
              Hola {safe_name}, recibimos una solicitud para restablecer la contraseña de tu cuenta.
            </p>
            <p style="margin:24px 0;">
              <a href="{safe_link}"
                 style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;
                        padding:12px 24px;border-radius:8px;font-size:14px;font-weight:bold;">
                Restablecer contraseña
              </a>
            </p>
            <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#737373;">
              El enlace vence en {minutes} minutos. Si el botón no funciona, copia esta dirección en tu navegador:
            </p>
            <p style="margin:0 0 16px;font-size:12px;word-break:break-all;color:#818cf8;">{safe_link}</p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:#737373;">
              Si no hiciste esta solicitud, ignora este correo: tu contraseña no cambiará.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
""",
        subtype="html",
    )
    return msg


def send_reset_email(to_email: str, full_name: str, reset_link: str) -> bool:
    """Envía el correo de recuperación. Devuelve True si se envió.

    Nunca lanza excepciones: se ejecuta en segundo plano y un fallo de correo
    no debe romper la solicitud ni revelar si la cuenta existe.
    """
    if not email_configured():
        print(f"[DEV] SMTP no configurado. Enlace de recuperación para {to_email}: {reset_link}")
        return False

    try:
        msg = _build_message(to_email, full_name, reset_link)
        context = ssl.create_default_context()
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context, timeout=20) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
                if settings.SMTP_STARTTLS:
                    server.starttls(context=context)
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        print(f"✉️  Correo de recuperación enviado a {to_email}")
        return True
    except Exception as exc:  # noqa: BLE001
        # No se imprime la contraseña ni el enlace con el token
        print(f"⚠️  No se pudo enviar el correo de recuperación a {to_email}: {type(exc).__name__}: {exc}")
        return False