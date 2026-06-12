from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine

# Todos los modelos ANTES de create_all
from app.models.user import User                    # noqa: F401
from app.models.service import Service              # noqa: F401
from app.models.professional import Professional    # noqa: F401
from app.models.client import Client                # noqa: F401  
from app.models.appointment import Appointment 
from app.models.business_settings import BusinessSettings  

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(services.router)
app.include_router(professionals.router)
app.include_router(clients.router)                  # ← VERIFICAR
app.include_router(appointments.router)  
app.include_router(settings_router.router)
@app.get("/")
def root():
    return {"status": "ok", "app": "Entre Manos API v1.0"}