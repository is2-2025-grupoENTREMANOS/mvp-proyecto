from sqlalchemy import (
    Column, Integer, String, Boolean,
    DateTime, Text, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# ── Tabla intermedia profesional ↔ servicio ─────────────────────
professional_services = Table(
    "professional_services",
    Base.metadata,
    Column(
        "professional_id",
        Integer,
        ForeignKey("professionals.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "service_id",
        Integer,
        ForeignKey("services.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Professional(Base):
    __tablename__ = "professionals"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    nombre       = Column(String(100), nullable=False)
    especialidad = Column(String(150), nullable=True)
    telefono     = Column(String(20),  nullable=True)
    email        = Column(String(150), nullable=True)
    descripcion  = Column(Text,        nullable=True)
    avatar_url   = Column(String(500), nullable=True)
    activo       = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    # Relación muchos a muchos con Service
    services = relationship(
        "Service",
        secondary=professional_services,
        backref="professionals",
        lazy="selectin",
    )

    # Relación con User (opcional — si el profesional tiene cuenta)
    user = relationship("User", backref="professional", lazy="selectin")

    def __repr__(self):
        return f"<Professional {self.nombre}>"