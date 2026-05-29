from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.schemas.professional import (
    ProfessionalCreate,
    ProfessionalUpdate,
    ProfessionalResponse,
)
from app.services.professional_service import (
    get_all_professionals,
    get_professional_by_id,
    create_professional,
    update_professional,
    delete_professional,
)
from app.routers.auth import get_current_user, require_admin

router = APIRouter(prefix="/professionals", tags=["Profesionales"])


# ── Público — lista profesionales activos ──────────────────────
@router.get("/", response_model=List[ProfessionalResponse])
def list_professionals(db: Session = Depends(get_db)):
    return get_all_professionals(db, solo_activos=True)


# ── Admin — lista todos incluyendo inactivos ───────────────────
@router.get("/all", response_model=List[ProfessionalResponse])
def list_all_professionals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_all_professionals(db, solo_activos=False)


# ── Público — detalle de un profesional ───────────────────────
@router.get("/{professional_id}", response_model=ProfessionalResponse)
def get_professional(professional_id: int, db: Session = Depends(get_db)):
    professional = get_professional_by_id(db, professional_id)
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado",
        )
    return professional


# ── Admin — crear profesional ──────────────────────────────────
@router.post("/", response_model=ProfessionalResponse, status_code=status.HTTP_201_CREATED)
def create_new_professional(
    data: ProfessionalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_professional(db, data)


# ── Admin — editar profesional ─────────────────────────────────
@router.put("/{professional_id}", response_model=ProfessionalResponse)
def update_existing_professional(
    professional_id: int,
    data: ProfessionalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    professional = update_professional(db, professional_id, data)
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado",
        )
    return professional


# ── Admin — desactivar profesional ────────────────────────────
@router.delete("/{professional_id}", status_code=status.HTTP_200_OK)
def deactivate_professional(
    professional_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    success = delete_professional(db, professional_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado",
        )
    return {"message": "Profesional desactivado correctamente"}