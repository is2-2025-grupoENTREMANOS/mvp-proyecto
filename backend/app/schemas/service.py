from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ServiceCreate(BaseModel):
    nombre:      str   = Field(..., min_length=2, max_length=150)
    descripcion: Optional[str]   = None
    duracion:    int   = Field(..., gt=0, description="Duración en minutos")
    precio:      float = Field(..., gt=0)
    imagen_url:  Optional[str]   = None


class ServiceUpdate(BaseModel):
    nombre:      Optional[str]   = None
    descripcion: Optional[str]   = None
    duracion:    Optional[int]   = Field(None, gt=0)
    precio:      Optional[float] = Field(None, gt=0)
    imagen_url:  Optional[str]   = None
    activo:      Optional[bool]  = None


class ServiceResponse(BaseModel):
    id:          int
    nombre:      str
    descripcion: Optional[str]
    duracion:    int
    precio:      float
    imagen_url:  Optional[str]
    activo:      bool
    created_at:  Optional[datetime] = None

    model_config = {"from_attributes": True}