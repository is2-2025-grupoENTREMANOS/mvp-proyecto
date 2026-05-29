from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    duracion    = Column(Integer, nullable=False)   # minutos
    precio      = Column(Float, nullable=False)
    imagen_url  = Column(String(500), nullable=True)
    activo      = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Service {self.nombre}>"