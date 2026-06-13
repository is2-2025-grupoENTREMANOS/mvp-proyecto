from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine

# Modelos
from app.models.user import User
from app.models.service import Service
from app.models.professional import Professional
from app.models.client import Client
from app.models.appointment import Appointment
from app.models.business_settings import BusinessSettings

# Routers
from app.routers import auth
from app.routers import services
from app.routers import professionals
from app.routers import clients
from app.routers import appointments
from app.routers import settings as settings_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Entre Manos API",
    version="1.0.0"
)

# ── CORS ─────────────────────────────────────
origins = [
    "http://localhost:5173",   # React local
    "http://127.0.0.1:5173",
    "https://TU-FRONTEND.vercel.app",  # CAMBIAR luego
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(professionals.router)
app.include_router(clients.router)
app.include_router(appointments.router)
app.include_router(settings_router.router)

@app.get("/")
def root():
    return {
        "status": "ok",
        "app": "Entre Manos API v1.0"
    }