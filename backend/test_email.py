from app.services.notifications.email_service import send_email

send_email(
    "zharymariothpintomena@gmail.com",
    "✨ EntreManos funcionando",
    """
    <h1>Hola Zhary la mejor ing de sistemas✨</h1>
    <p>Tu sistema de correo funciona perfectamente.</p>
    """
)

print("Correo enviado")