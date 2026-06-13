from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.core.database import Base   # ← importa desde core
import enum

class RolEnum(str, enum.Enum):
    admin       = "admin"
    profesional = "profesional"

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(100), nullable=False)
    email      = Column(String(150), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    rol        = Column(Enum(RolEnum), default=RolEnum.profesional, nullable=False)
    activo     = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())