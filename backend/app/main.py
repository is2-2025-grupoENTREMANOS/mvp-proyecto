"""
Entre Manos — API Backend
FastAPI + SQLAlchemy + MySQL
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import auth

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Entre Manos API",
    description="Sistema de agendamiento de citas para spa & estética",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — Permite que el frontend React se comunique con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router, prefix="/api/v1")
# TODO próximas semanas:
# app.include_router(appointments.router, prefix="/api/v1")
# app.include_router(professionals.router, prefix="/api/v1")
# app.include_router(services.router,      prefix="/api/v1")
# app.include_router(admin.router,         prefix="/api/v1")

@app.get("/", tags=["Health"])
def root():
    return {
        "app":     settings.APP_NAME,
        "status":  "online",
        "version": "1.0.0",
        "docs":    "/api/docs",
    }

@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
