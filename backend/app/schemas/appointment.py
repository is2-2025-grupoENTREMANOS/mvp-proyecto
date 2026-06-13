from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from app.models.appointment import EstadoCita, MetodoPago
from app.schemas.client import ClientResponse
from app.schemas.professional import ProfessionalResponse
from app.schemas.service import ServiceResponse


# ── Cuestionario previo (requisito patrocinadora) ───────────────
class CuestionarioPrevio(BaseModel):
    tiene_esmalte:     Optional[bool]  = False
    tipo_esmalte:      Optional[str]   = None   # normal, semipermanente, acrílico
    alergia_productos: Optional[bool]  = False
    notas_adicionales: Optional[str]   = None


# ── Crear cita ──────────────────────────────────────────────────
class AppointmentCreate(BaseModel):
    client_id:       int
    professional_id: int
    service_id:      int
    fecha_inicio:    datetime
    fecha_fin:       Optional[datetime] = None

    # Abono obligatorio mínimo 50%
    precio_total:    float = Field(..., gt=0)
    abono:           float = Field(..., ge=0)
    metodo_pago:     Optional[MetodoPago] = None

    # Cuestionario previo
    cuestionario:    Optional[str] = None
    costo_adicional: float = Field(default=0.0, ge=0)

    # Lista de espera
    en_lista_espera: bool = False
    notas:           Optional[str] = None

    @validator('abono')
    def abono_minimo_cincuenta_por_ciento(cls, abono, values):
        """
        Requisito patrocinadora: abono mínimo del 50%.
        """
        precio = values.get('precio_total', 0)
        if precio > 0 and abono < (precio * 0.50):
            raise ValueError(
                f'El abono mínimo es el 50% del precio total '
                f'(${precio * 0.50:.0f}). Abono ingresado: ${abono:.0f}'
            )
        return abono


# ── Actualizar cita ─────────────────────────────────────────────
class AppointmentUpdate(BaseModel):
    professional_id: Optional[int]         = None
    service_id:      Optional[int]         = None
    fecha_inicio:    Optional[datetime]    = None
    fecha_fin:       Optional[datetime]    = None
    estado:          Optional[EstadoCita]  = None
    precio_total:    Optional[float]       = None
    abono:           Optional[float]       = None
    metodo_pago:     Optional[MetodoPago]  = None
    cuestionario:    Optional[str]         = None
    costo_adicional: Optional[float]       = None
    en_lista_espera: Optional[bool]        = None
    notas:           Optional[str]         = None


# ── Respuesta completa ──────────────────────────────────────────
class AppointmentResponse(BaseModel):
    id:              int
    client_id:       Optional[int]
    professional_id: Optional[int]
    service_id:      Optional[int]
    fecha_inicio:    datetime
    fecha_fin:       Optional[datetime]
    estado:          EstadoCita
    precio_total:    Optional[float]
    abono:           Optional[float]
    metodo_pago:     Optional[MetodoPago]
    cuestionario:    Optional[str]
    costo_adicional: Optional[float]
    en_lista_espera: bool
    orden_espera:    Optional[int]
    notas:           Optional[str]
    created_at:      Optional[datetime]

    # Objetos anidados para el frontend
    client:       Optional[ClientResponse]       = None
    professional: Optional[ProfessionalResponse] = None
    service:      Optional[ServiceResponse]      = None

    model_config = {"from_attributes": True}


# ── Respuesta resumida para la agenda ───────────────────────────
class AppointmentAgendaResponse(BaseModel):
    id:              int
    fecha_inicio:    datetime
    fecha_fin:       Optional[datetime]
    estado:          EstadoCita
    precio_total:    Optional[float]
    abono:           Optional[float]
    en_lista_espera: bool

    # Datos básicos sin anidar objetos completos
    client_nombre:       Optional[str] = None
    professional_nombre: Optional[str] = None
    service_nombre:      Optional[str] = None
    service_duracion:    Optional[int] = None

    model_config = {"from_attributes": True}