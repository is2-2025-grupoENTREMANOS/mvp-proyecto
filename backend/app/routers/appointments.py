from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter
from app.models.appointment import Appointment

from app.core.database import get_db
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


# ── GET /appointments/ — todas las citas (admin) ────────────────
# Dependencia opcional — no falla si no hay token:
security_optional = HTTPBearer(auto_error=False)

@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(
    client_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # IMPORTANTE: definir query primero
    query = db.query(Appointment)

    # Si viene client_id, filtrar solo las citas de ese cliente
    if client_id is not None:
        query = query.filter(Appointment.client_id == client_id)

    # Ordenar por fecha
    appointments = (
        query
        .order_by(Appointment.fecha_inicio.desc())
        .all()
    )

    return appointments

# ── GET /appointments/waitlist — lista de espera (admin) ────────
@router.get("/waitlist", response_model=List[AppointmentResponse])
def list_waitlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_waitlist(db)


# ── GET /appointments/by-date — filtrar por rango de fechas ─────
@router.get("/by-date", response_model=List[AppointmentResponse])
def list_by_date(
    fecha_inicio: datetime = Query(...),
    fecha_fin:    datetime = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_appointments_by_date_range(db, fecha_inicio, fecha_fin)


# ── GET /appointments/professional/{id} ─────────────────────────
@router.get(
    "/professional/{professional_id}",
    response_model=List[AppointmentResponse],
)
def list_by_professional(
    professional_id: int,
    db: Session = Depends(get_db),
):
    return get_appointments_by_professional(db, professional_id)


# ── GET /appointments/check-availability ────────────────────────
@router.get("/check-availability")
def check_availability(
    professional_id: int   = Query(...),
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


# ── POST /appointments/ — crear cita ────────────────────────────
@router.post(
    "/",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # Verificar disponibilidad si no es lista de espera
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


# ── PUT /appointments/{id} — actualizar cita ────────────────────
@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_existing_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    appt = update_appointment(db, appointment_id, data)
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada",
        )
    return appt


# ── PATCH /appointments/{id}/cancel — cancelar cita ─────────────
@router.patch(
    "/{appointment_id}/cancel",
    response_model=AppointmentResponse,
)
def cancel_existing_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    appt = cancel_appointment(db, appointment_id)
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada",
        )
    return appt