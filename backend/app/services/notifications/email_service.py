from dotenv import load_dotenv
load_dotenv()

import os
import smtplib
from email.mime.text import MIMEText

EMAIL_USER = os.getenv("SMTP_USER")
EMAIL_PASSWORD = os.getenv("SMTP_PASSWORD")

print(EMAIL_USER)
print(EMAIL_PASSWORD)

def send_email(to_email, subject, body):

    msg = MIMEText(body, "html")

    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    server = smtplib.SMTP("smtp.gmail.com", 587)

    server.starttls()

    server.login(EMAIL_USER, EMAIL_PASSWORD)

    server.sendmail(
        EMAIL_USER,
        to_email,
        msg.as_string()
    )

    server.quit()