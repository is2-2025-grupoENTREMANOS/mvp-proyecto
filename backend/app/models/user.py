"""
Entre Manos — Modelos de base de datos (SQLAlchemy ORM)
Cada clase = una tabla en MySQL
"""
from datetime import datetime, date, time
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Date, Time, Text, ForeignKey, Numeric, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

# ── Enumeraciones ─────────────────────────────────────────────────────────────
class RoleEnum(str, enum.Enum):
    admin       = "admin"
    profesional = "profesional"

class AppointmentStatus(str, enum.Enum):
    pendiente   = "pendiente"
    confirmada  = "confirmada"
    cancelada   = "cancelada"
    completada  = "completada"
    lista_espera = "lista_espera"

# ── Tabla: users (admin + profesionales) ─────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(100), nullable=False)
    email      = Column(String(150), unique=True, index=True, nullable=False)
    telefono   = Column(String(20))
    password   = Column(String(255), nullable=False)
    role       = Column(Enum(RoleEnum), default=RoleEnum.profesional, nullable=False)
    activo     = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    citas      = relationship("Appointment", back_populates="profesional",
                               foreign_keys="Appointment.profesional_id")
    horarios   = relationship("Schedule", back_populates="profesional")

# ── Tabla: clients ────────────────────────────────────────────────────────────
class Client(Base):
    __tablename__ = "clients"

    id         = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(100), nullable=False)
    telefono   = Column(String(20), nullable=False)
    email      = Column(String(150))
    created_at = Column(DateTime, default=datetime.utcnow)

    citas      = relationship("Appointment", back_populates="cliente")

# ── Tabla: services ───────────────────────────────────────────────────────────
class Service(Base):
    __tablename__ = "services"

    id              = Column(Integer, primary_key=True, index=True)
    nombre          = Column(String(100), nullable=False)
    descripcion     = Column(Text)
    duracion_minutos = Column(Integer, default=60)
    precio_base     = Column(Numeric(10, 2), nullable=False)
    imagen_url      = Column(String(300))
    activo          = Column(Boolean, default=True)

    citas           = relationship("Appointment", back_populates="servicio")

# ── Tabla: appointments ───────────────────────────────────────────────────────
class Appointment(Base):
    __tablename__ = "appointments"

    id               = Column(Integer, primary_key=True, index=True)
    cliente_id       = Column(Integer, ForeignKey("clients.id"), nullable=False)
    profesional_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    servicio_id      = Column(Integer, ForeignKey("services.id"), nullable=False)

    fecha            = Column(Date, nullable=False)
    hora_inicio      = Column(Time, nullable=False)
    hora_fin         = Column(Time, nullable=False)

    estado           = Column(Enum(AppointmentStatus), default=AppointmentStatus.pendiente)
    abono_pagado     = Column(Boolean, default=False)
    monto_abono      = Column(Numeric(10, 2), default=0)
    notas_previas    = Column(Text)          # preguntas previas (esmalte, etc.)
    notas_internas   = Column(Text)

    notif_recordatorio_enviada  = Column(Boolean, default=False)
    notif_cancelacion_enviada   = Column(Boolean, default=False)

    created_at       = Column(DateTime, default=datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    cliente          = relationship("Client", back_populates="citas")
    profesional      = relationship("User", back_populates="citas",
                                    foreign_keys=[profesional_id])
    servicio         = relationship("Service", back_populates="citas")

# ── Tabla: schedules (disponibilidad del profesional) ─────────────────────────
class Schedule(Base):
    __tablename__ = "schedules"

    id             = Column(Integer, primary_key=True, index=True)
    profesional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dia_semana     = Column(Integer, nullable=False)   # 0=Lunes … 6=Domingo
    hora_inicio    = Column(Time, nullable=False)
    hora_fin       = Column(Time, nullable=False)
    activo         = Column(Boolean, default=True)

    profesional    = relationship("User", back_populates="horarios")

# ── Tabla: waitlist (lista de espera) ─────────────────────────────────────────
class Waitlist(Base):
    __tablename__ = "waitlist"

    id             = Column(Integer, primary_key=True, index=True)
    cliente_id     = Column(Integer, ForeignKey("clients.id"), nullable=False)
    servicio_id    = Column(Integer, ForeignKey("services.id"), nullable=False)
    profesional_id = Column(Integer, ForeignKey("users.id"))
    fecha_preferida = Column(Date)
    notificado     = Column(Boolean, default=False)
    created_at     = Column(DateTime, default=datetime.utcnow)
