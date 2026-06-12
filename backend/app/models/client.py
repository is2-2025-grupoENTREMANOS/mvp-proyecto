from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id         = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(100), nullable=False)
    telefono   = Column(String(20),  nullable=True)
    email      = Column(String(150), nullable=True, index=True)
    notas      = Column(Text,        nullable=True)
    activo     = Column(Boolean, default=True)
    bloqueado  = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Client {self.nombre}>"