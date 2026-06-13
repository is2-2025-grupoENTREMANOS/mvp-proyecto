"""
Entre Manos — Servicio de Notificaciones
- WhatsApp vía Twilio
- Email vía Gmail SMTP
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

# ── WhatsApp (Twilio) ─────────────────────────────────────────────────────────
def send_whatsapp(to_phone: str, message: str) -> bool:
    """
    Envía un mensaje de WhatsApp usando Twilio.
    to_phone debe ser número con código de país, ej: +573001234567
    """
    if not settings.TWILIO_ACCOUNT_SID:
        logger.warning("Twilio no configurado. Mensaje no enviado.")
        return False
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{to_phone}",
            body=message,
        )
        logger.info(f"WhatsApp enviado a {to_phone}")
        return True
    except Exception as e:
        logger.error(f"Error Twilio: {e}")
        return False

# ── Email (Gmail SMTP) ────────────────────────────────────────────────────────
def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not settings.GMAIL_USER:
        logger.warning("Gmail no configurado. Email no enviado.")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"Entre Manos <{settings.GMAIL_USER}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
            server.sendmail(settings.GMAIL_USER, to_email, msg.as_string())
        logger.info(f"Email enviado a {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error Gmail: {e}")
        return False

# ── Templates de mensajes ─────────────────────────────────────────────────────
def msg_confirmacion(cliente: str, servicio: str, fecha: str, hora: str, profesional: str) -> str:
    return (
        f"✨ *Entre Manos* — Cita confirmada\n\n"
        f"Hola {cliente} 👋\n"
        f"Tu cita de *{servicio}* está confirmada.\n\n"
        f"📅 Fecha: {fecha}\n"
        f"⏰ Hora: {hora}\n"
        f"💅 Profesional: {profesional}\n\n"
        f"Si necesitas cancelar o reprogramar, escríbenos con al menos 24h de anticipación."
    )

def msg_recordatorio(cliente: str, servicio: str, fecha: str, hora: str) -> str:
    return (
        f"⏰ *Entre Manos* — Recordatorio\n\n"
        f"Hola {cliente}! Te recordamos que mañana tienes:\n\n"
        f"💆 Servicio: *{servicio}*\n"
        f"📅 {fecha} a las {hora}\n\n"
        f"¡Te esperamos! 🌸"
    )

def msg_cancelacion(cliente: str, servicio: str, fecha: str) -> str:
    return (
        f"❌ *Entre Manos* — Cita cancelada\n\n"
        f"Hola {cliente}, tu cita de *{servicio}* del {fecha} fue cancelada.\n\n"
        f"Si deseas reagendar, visita nuestro sitio o escríbenos."
    )

def msg_lista_espera(cliente: str, servicio: str) -> str:
    return (
        f"🎉 *Entre Manos* — ¡Cupo disponible!\n\n"
        f"Hola {cliente}, se liberó un cupo para *{servicio}*.\n"
        f"Ingresa a nuestro sitio para agendar antes de que se ocupe. ⏳"
    )
