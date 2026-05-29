from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine

# Importar TODOS los modelos antes de create_all
from app.models.user import User                    # noqa: F401
from app.models.service import Service              # noqa: F401
from app.models.professional import Professional    # noqa: F401  ← NUEVA

from app.routers import auth
from app.routers import services
from app.routers import professionals               # ← NUEVA


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Entre Manos API",
    version="1.0.0",
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

@app.get("/")
def root():
    return {"status": "ok", "app": "Entre Manos API v1.0"}