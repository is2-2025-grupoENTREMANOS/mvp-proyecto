from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Reconecta si la conexión se cayó
    pool_recycle=3600,       # Recicla conexiones cada hora
    echo=(settings.ENVIRONMENT == "development"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# Dependency para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
