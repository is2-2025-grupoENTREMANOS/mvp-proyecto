from typing import List, Optional
from datetime import datetime
 
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
 
from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
)
from app.services.appointment_service import (
    get_all_appointments,
    get_appointment_by_id,
    get_appointments_by_professional,
    get_appointments_by_date_range,
    get_waitlist,
    check_professional_availability,
    create_appointment,
    update_appointment,
    cancel_appointment,
)
from app.routers.auth import get_current_user, require_admin
 
router = APIRouter(prefix="/appointments", tags=["Citas"])
 
# Token opcional — no lanza error si no viene
_optional_bearer = HTTPBearer(auto_error=False)
 
 
# ── GET /appointments/ ──────────────────────────────────────────
# Público cuando viene client_id (portal cliente).
# Requiere token cuando NO viene client_id (admin/profesional).
@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(
    client_id:   Optional[int] = Query(None),
    db:          Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
):
    query = db.query(Appointment)
 
    if client_id is not None:
        # Portal cliente — público, solo devuelve citas de ese cliente
        query = query.filter(Appointment.client_id == client_id)
        return query.order_by(Appointment.fecha_inicio.desc()).all()
 
    # Sin client_id → requiere token válido
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticación requerida",
        )
    from app.core.security import decode_token
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )
    return query.order_by(Appointment.fecha_inicio.desc()).all()
 
 
# ── GET /appointments/waitlist ──────────────────────────────────
@router.get("/waitlist", response_model=List[AppointmentResponse])
def list_waitlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_waitlist(db)
 
 
# ── GET /appointments/by-date ───────────────────────────────────
@router.get("/by-date", response_model=List[AppointmentResponse])
def list_by_date(
    fecha_inicio: datetime = Query(...),
    fecha_fin:    datetime = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_appointments_by_date_range(db, fecha_inicio, fecha_fin)
 
 
# ── GET /appointments/professional/{id} ─────────────────────────
@router.get("/professional/{professional_id}", response_model=List[AppointmentResponse])
def list_by_professional(
    professional_id: int,
    db: Session = Depends(get_db),
):
    return get_appointments_by_professional(db, professional_id)
 
 
# ── GET /appointments/check-availability ────────────────────────
@router.get("/check-availability")
def check_availability(
    professional_id: int      = Query(...),
    fecha_inicio:    datetime = Query(...),
    fecha_fin:       datetime = Query(...),
    db: Session = Depends(get_db),
):
    available = check_professional_availability(
        db, professional_id, fecha_inicio, fecha_fin
    )
    return {"disponible": available}
 
 
# ── GET /appointments/{id} ───────────────────────────────────────
@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = get_appointment_by_id(db, appointment_id)
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada",
        )
    return appt
 
 
# ── POST /appointments/ ─────────────────────────────────────────
# Público para BookingPage (clientes sin sesión crean citas)
@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_new_appointment(
    data: AppointmentCreate,
    db:   Session = Depends(get_db),
):
    if not data.en_lista_espera:
        disponible = check_professional_availability(
            db,
            data.professional_id,
            data.fecha_inicio,
            data.fecha_fin or data.fecha_inicio,
        )
        if not disponible:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El profesional no está disponible en ese horario",
            )
    return create_appointment(db, data)
 
 
# ── PUT /appointments/{id} ──────────────────────────────────────
@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_existing_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = update_appointment(db, appointment_id, data)
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada",
        )
    return appt
 
 
# ── PATCH /appointments/{id}/cancel ────────────────────────────
# Público: el portal cliente puede cancelar sus propias citas sin token
@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_existing_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
):
    appt = cancel_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada",
        )
    return appt
 