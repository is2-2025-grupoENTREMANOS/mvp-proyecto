from twilio.rest import Client
from dotenv import load_dotenv
import os

load_dotenv()

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

print(TWILIO_SID)
print(TWILIO_TOKEN)
print(TWILIO_PHONE)

client = Client(TWILIO_SID, TWILIO_TOKEN)

def send_whatsapp(to, message):

    client.messages.create(
        body=message,
        from_=f"whatsapp:{TWILIO_PHONE}",
        to=f"whatsapp:{to}"
    )