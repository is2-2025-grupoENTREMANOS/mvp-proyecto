from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.services.client_service import (
    get_all_clients,
    get_active_clients,
    get_client_by_id,
    search_clients,
    create_client,
    update_client,
    block_client,
    delete_client,
)
from app.routers.auth import require_admin


router = APIRouter(prefix="/clients", tags=["Clientes"])


# ── Admin — lista todos los clientes ──────────────────────────
@router.get("/", response_model=List[ClientResponse])
def list_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_all_clients(db)


# ── Admin — buscar clientes por nombre o teléfono ─────────────
@router.get("/search", response_model=List[ClientResponse])
def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    return search_clients(db, q)


# ── Admin — detalle de un cliente ──────────────────────────────
@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    client = get_client_by_id(db, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado",
        )
    return client


# ── Admin — crear cliente ──────────────────────────────────────
@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_new_client(
    data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_client(db, data)


# ── Admin — editar cliente ─────────────────────────────────────
@router.put("/{client_id}", response_model=ClientResponse)
def update_existing_client(
    client_id: int,
    data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    client = update_client(db, client_id, data)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado",
        )
    return client


# ── Admin — bloquear cliente ───────────────────────────────────
@router.patch("/{client_id}/block", response_model=ClientResponse)
def block_existing_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    client = block_client(db, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado",
        )
    return client


# ── Admin — desactivar cliente ─────────────────────────────────
@router.delete("/{client_id}", status_code=status.HTTP_200_OK)
def deactivate_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    success = delete_client(db, client_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado",
        )
    return {"message": "Cliente desactivado correctamente"}