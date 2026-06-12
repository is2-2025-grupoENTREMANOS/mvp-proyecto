from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, Text, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum
from sqlalchemy import Numeric

class EstadoCita(str, enum.Enum):
    pendiente  = "pendiente"
    confirmada = "confirmada"
    cancelada  = "cancelada"
    completada = "completada"
    en_espera  = "en_espera"   # lista de espera


class MetodoPago(str, enum.Enum):
    efectivo      = "efectivo"
    transferencia = "transferencia"
    tarjeta       = "tarjeta"


class Appointment(Base):
    __tablename__ = "appointments"

    id              = Column(Integer, primary_key=True, index=True)

    # Relaciones principales
    client_id       = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    professional_id = Column(Integer, ForeignKey("professionals.id", ondelete="SET NULL"), nullable=True)
    service_id      = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True)

    # Fecha y hora
    fecha_inicio = Column(DateTime(timezone=True), nullable=False) 
    fecha_fin = Column(DateTime(timezone=True), nullable=True)

    # Estado
    estado          = Column(Enum(EstadoCita), default=EstadoCita.pendiente, nullable=False)

    # Requisito patrocinadora: abono obligatorio 50%

    precio_total    = Column(Numeric(10, 2), nullable=True)
    abono           = Column(Numeric(10, 2), default=0)
    costo_adicional = Column(Numeric(10, 2), default=0)
    metodo_pago     = Column(Enum(MetodoPago), nullable=True)

    # Requisito patrocinadora: cuestionario previo
    # Respuestas guardadas como texto JSON o texto libre
    cuestionario    = Column(Text, nullable=True)
    costo_adicional = Column(Float, default=0.0)

    # Lista de espera
    en_lista_espera = Column(Boolean, default=False)
    orden_espera    = Column(Integer, nullable=True)

    # Notas generales
    notas           = Column(Text, nullable=True)

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones para acceder a los objetos relacionados
    client       = relationship("Client",       lazy="selectin")
    professional = relationship("Professional", lazy="selectin")
    service      = relationship("Service",      lazy="selectin")

    def __repr__(self):
        return f"<Appointment {self.id} - {self.estado}>"