from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.services.service_service import (
    get_all_services,
    get_service_by_id,
    create_service,
    update_service,
    delete_service,
)
from app.routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/services", tags=["Servicios"])


# ── Público — cualquier visitante puede ver servicios activos ──
@router.get("/", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    return get_all_services(db, solo_activos=True)


# ── Admin — ve todos incluyendo inactivos ──────────────────────
@router.get("/all", response_model=List[ServiceResponse])
def list_all_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_all_services(db, solo_activos=False)


# ── Público — detalle de un servicio ──────────────────────────
@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = get_service_by_id(db, service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )
    return service


# ── Admin — crear servicio ─────────────────────────────────────
@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_new_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_service(db, data)


# ── Admin — editar servicio ────────────────────────────────────
@router.put("/{service_id}", response_model=ServiceResponse)
def update_existing_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = update_service(db, service_id, data)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )
    return service


# ── Admin — desactivar servicio ────────────────────────────────
@router.delete("/{service_id}", status_code=status.HTTP_200_OK)
def deactivate_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    success = delete_service(db, service_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )
    return {"message": "Servicio desactivado correctamente"}