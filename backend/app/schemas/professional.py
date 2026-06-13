from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.service import ServiceResponse


class ProfessionalCreate(BaseModel):
    nombre:       str            = Field(..., min_length=2, max_length=100)
    especialidad: Optional[str]  = None
    telefono:     Optional[str]  = None
    email:        Optional[EmailStr] = None
    descripcion:  Optional[str]  = None
    avatar_url:   Optional[str]  = None
    user_id:      Optional[int]  = None
    service_ids:  List[int]      = []    # servicios que realiza


class ProfessionalUpdate(BaseModel):
    nombre:       Optional[str]       = None
    especialidad: Optional[str]       = None
    telefono:     Optional[str]       = None
    email:        Optional[EmailStr]  = None
    descripcion:  Optional[str]       = None
    avatar_url:   Optional[str]       = None
    activo:       Optional[bool]      = None
    service_ids:  Optional[List[int]] = None


class ProfessionalResponse(BaseModel):
    id:           int
    nombre:       str
    especialidad: Optional[str]
    telefono:     Optional[str]
    email:        Optional[str]
    descripcion:  Optional[str]
    avatar_url:   Optional[str]
    activo:       bool
    user_id:      Optional[int]
    services:     List[ServiceResponse] = []
    created_at:   Optional[datetime]    = None

    model_config = {"from_attributes": True}