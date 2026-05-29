from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.professional import Professional
from app.models.service import Service
from app.schemas.professional import ProfessionalCreate, ProfessionalUpdate


def _get_services_by_ids(db: Session, ids: List[int]) -> List[Service]:
    if not ids:
        return []
    return db.query(Service).filter(Service.id.in_(ids)).all()


def get_all_professionals(db: Session, solo_activos: bool = False) -> List[Professional]:
    query = db.query(Professional)
    if solo_activos:
        query = query.filter(Professional.activo == True)
    return query.order_by(Professional.nombre).all()


def get_professional_by_id(db: Session, professional_id: int) -> Optional[Professional]:
    return db.query(Professional).filter(Professional.id == professional_id).first()


def create_professional(db: Session, data: ProfessionalCreate) -> Professional:
    services = _get_services_by_ids(db, data.service_ids)

    professional = Professional(
        nombre       = data.nombre,
        especialidad = data.especialidad,
        telefono     = data.telefono,
        email        = data.email,
        descripcion  = data.descripcion,
        avatar_url   = data.avatar_url,
        user_id      = data.user_id,
        services     = services,
    )
    db.add(professional)
    db.commit()
    db.refresh(professional)
    return professional


def update_professional(
    db: Session,
    professional_id: int,
    data: ProfessionalUpdate,
) -> Optional[Professional]:
    professional = get_professional_by_id(db, professional_id)
    if not professional:
        return None

    campos = data.model_dump(exclude_unset=True)

    # Manejar service_ids por separado (es una relación, no un campo simple)
    if "service_ids" in campos:
        professional.services = _get_services_by_ids(db, campos.pop("service_ids"))

    for campo, valor in campos.items():
        setattr(professional, campo, valor)

    db.commit()
    db.refresh(professional)
    return professional


def delete_professional(db: Session, professional_id: int) -> bool:
    professional = get_professional_by_id(db, professional_id)
    if not professional:
        return False
    professional.activo = False
    db.commit()
    return True