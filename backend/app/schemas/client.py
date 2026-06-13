from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class ClientCreate(BaseModel):
    nombre:   str            = Field(..., min_length=2, max_length=100)
    telefono: Optional[str]  = None
    email:    Optional[EmailStr] = None
    notas:    Optional[str]  = None


class ClientUpdate(BaseModel):
    nombre:   Optional[str]       = None
    telefono: Optional[str]       = None
    email:    Optional[EmailStr]  = None
    notas:    Optional[str]       = None
    activo:   Optional[bool]      = None
    bloqueado: Optional[bool]     = None


class ClientResponse(BaseModel):
    id:        int
    nombre:    str
    telefono:  Optional[str]
    email:     Optional[str]
    notas:     Optional[str]
    activo:    bool
    bloqueado: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}