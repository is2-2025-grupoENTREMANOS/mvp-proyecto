from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.appointment import Appointment, EstadoCita
from app.models.professional import Professional
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


# ── Consultas ───────────────────────────────────────────────────

def get_all_appointments(db: Session) -> List[Appointment]:
    return (
        db.query(Appointment)
        .order_by(Appointment.fecha_inicio.desc())
        .all()
    )


def get_appointment_by_id(db: Session, appt_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appt_id).first()


def get_appointments_by_professional(
    db: Session, professional_id: int
) -> List[Appointment]:
    return (
        db.query(Appointment)
        .filter(Appointment.professional_id == professional_id)
        .order_by(Appointment.fecha_inicio)
        .all()
    )


def get_appointments_by_date_range(
    db: Session,
    fecha_inicio: datetime,
    fecha_fin: datetime,
) -> List[Appointment]:
    return (
        db.query(Appointment)
        .filter(
            Appointment.fecha_inicio >= fecha_inicio,
            Appointment.fecha_inicio <= fecha_fin,
        )
        .order_by(Appointment.fecha_inicio)
        .all()
    )


def get_waitlist(db: Session) -> List[Appointment]:
    return (
        db.query(Appointment)
        .filter(Appointment.en_lista_espera == True)
        .order_by(Appointment.orden_espera)
        .all()
    )


# ── Verificación de disponibilidad ─────────────────────────────

def check_professional_availability(
    db: Session,
    professional_id: int,
    fecha_inicio: datetime,
    fecha_fin: datetime,
    exclude_id: Optional[int] = None,
) -> bool:
    """
    Retorna True si el profesional está disponible en ese rango.
    Requisito patrocinadora: evitar cruce de horarios.
    """
    query = db.query(Appointment).filter(
        Appointment.professional_id == professional_id,
        Appointment.estado.notin_([EstadoCita.cancelada]),
        or_(
            and_(
                Appointment.fecha_inicio < fecha_fin,
                Appointment.fecha_fin > fecha_inicio,
            )
        )
    )
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)

    conflicto = query.first()
    return conflicto is None


# ── Gestión de lista de espera ──────────────────────────────────

def get_next_waitlist_order(db: Session) -> int:
    last = (
        db.query(Appointment)
        .filter(Appointment.en_lista_espera == True)
        .order_by(Appointment.orden_espera.desc())
        .first()
    )
    return (last.orden_espera + 1) if last and last.orden_espera else 1


def promote_from_waitlist(db: Session, professional_id: int) -> Optional[Appointment]:
    """
    Requisito patrocinadora: al liberarse un turno,
    notifica al primer cliente en lista de espera.
    """
    next_in_line = (
        db.query(Appointment)
        .filter(
            Appointment.en_lista_espera == True,
            Appointment.professional_id == professional_id,
        )
        .order_by(Appointment.orden_espera)
        .first()
    )
    if next_in_line:
        next_in_line.en_lista_espera = False
        next_in_line.orden_espera    = None
        next_in_line.estado          = EstadoCita.pendiente
        db.commit()
        db.refresh(next_in_line)
    return next_in_line


# ── CRUD ────────────────────────────────────────────────────────

def create_appointment(db: Session, data: AppointmentCreate) -> Appointment:

    # Si no viene fecha_fin, calcular automáticamente +1 hora
    fecha_fin = data.fecha_fin

    if fecha_fin is None:
        from datetime import timedelta
        fecha_fin = data.fecha_inicio + timedelta(hours=1)

    appt = Appointment(
        client_id       = data.client_id,
        professional_id = data.professional_id,
        service_id      = data.service_id,
        fecha_inicio    = data.fecha_inicio,
        fecha_fin       = fecha_fin,
        estado          = EstadoCita.en_espera if data.en_lista_espera else EstadoCita.pendiente,
        precio_total    = data.precio_total,
        abono           = data.abono,
        metodo_pago     = data.metodo_pago,
        cuestionario    = data.cuestionario,
        costo_adicional = data.costo_adicional,
        en_lista_espera = data.en_lista_espera,
        orden_espera    = get_next_waitlist_order(db) if data.en_lista_espera else None,
        notas           = data.notas,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


def update_appointment(
    db: Session,
    appt_id: int,
    data: AppointmentUpdate,
) -> Optional[Appointment]:
    appt = get_appointment_by_id(db, appt_id)
    if not appt:
        return None

    was_cancelled = appt.estado != EstadoCita.cancelada

    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(appt, campo, valor)

    db.commit()
    db.refresh(appt)

    # Si se canceló, promover al siguiente en lista de espera
    if data.estado == EstadoCita.cancelada and was_cancelled:
        promote_from_waitlist(db, appt.professional_id)

    return appt


def cancel_appointment(db: Session, appt_id: int) -> Optional[Appointment]:
    appt = get_appointment_by_id(db, appt_id)
    if not appt:
        return None

    professional_id = appt.professional_id
    appt.estado = EstadoCita.cancelada
    db.commit()
    db.refresh(appt)

    # Promover al siguiente en lista de espera
    promote_from_waitlist(db, professional_id)

    return appt