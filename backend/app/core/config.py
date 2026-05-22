from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL:                  str
    SECRET_KEY:                    str
    ALGORITHM:                     str  = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:   int  = 480
    FRONTEND_URL:                  str  = "http://localhost:5173"

    # Twilio
    TWILIO_ACCOUNT_SID:            str  = ""
    TWILIO_AUTH_TOKEN:             str  = ""
    TWILIO_WHATSAPP_FROM:          str  = "whatsapp:+14155238886"

    # Gmail
    GMAIL_USER:                    str  = ""
    GMAIL_APP_PASSWORD:            str  = ""

    APP_NAME:                      str  = "Entre Manos"
    ENVIRONMENT:                   str  = "development"

    class Config:
        env_file = ".env"

settings = Settings()
