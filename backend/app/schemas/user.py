from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import RolEnum


class UserResponse(BaseModel):
    id:         int
    nombre:     str
    email:      EmailStr
    rol:        RolEnum
    activo:     bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserResponse   # ← referencia directa, NO como string

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    nombre:   str
    email:    EmailStr
    password: str
    rol:      RolEnum = RolEnum.profesional


class UserUpdate(BaseModel):
    nombre:   Optional[str]      = None
    email:    Optional[EmailStr] = None
    password: Optional[str]      = None
    activo:   Optional[bool]     = None