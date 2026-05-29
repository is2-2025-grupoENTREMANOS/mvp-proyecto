from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


def get_all_services(db: Session, solo_activos: bool = False) -> List[Service]:
    query = db.query(Service)
    if solo_activos:
        query = query.filter(Service.activo == True)
    return query.order_by(Service.nombre).all()


def get_service_by_id(db: Session, service_id: int) -> Optional[Service]:
    return db.query(Service).filter(Service.id == service_id).first()


def create_service(db: Session, data: ServiceCreate) -> Service:
    service = Service(**data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def update_service(db: Session, service_id: int, data: ServiceUpdate) -> Optional[Service]:
    service = get_service_by_id(db, service_id)
    if not service:
        return None
    campos = data.model_dump(exclude_unset=True)
    for campo, valor in campos.items():
        setattr(service, campo, valor)
    db.commit()
    db.refresh(service)
    return service


def delete_service(db: Session, service_id: int) -> bool:
    service = get_service_by_id(db, service_id)
    if not service:
        return False
    # Borrado lógico — no elimina el registro de la BD
    service.activo = False
    db.commit()
    return True