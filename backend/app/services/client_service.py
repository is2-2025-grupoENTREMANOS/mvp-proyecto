from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate


def get_all_clients(db: Session) -> List[Client]:
    return db.query(Client).order_by(Client.nombre).all()


def get_active_clients(db: Session) -> List[Client]:
    return (
        db.query(Client)
        .filter(Client.activo == True, Client.bloqueado == False)
        .order_by(Client.nombre)
        .all()
    )


def get_client_by_id(db: Session, client_id: int) -> Optional[Client]:
    return db.query(Client).filter(Client.id == client_id).first()


def get_client_by_email(db: Session, email: str) -> Optional[Client]:
    return db.query(Client).filter(Client.email == email).first()


def search_clients(db: Session, query: str) -> List[Client]:
    term = f"%{query}%"
    return (
        db.query(Client)
        .filter(
            (Client.nombre.ilike(term)) | (Client.telefono.ilike(term)) | (Client.email.ilike(term))
        )
        .all()
    )


def create_client(db: Session, data: ClientCreate) -> Client:
    client = Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def update_client(db: Session, client_id: int, data: ClientUpdate) -> Optional[Client]:
    client = get_client_by_id(db, client_id)
    if not client:
        return None
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(client, campo, valor)
    db.commit()
    db.refresh(client)
    return client


def block_client(db: Session, client_id: int) -> Optional[Client]:
    client = get_client_by_id(db, client_id)
    if not client:
        return None
    client.bloqueado = True
    client.activo = False
    db.commit()
    db.refresh(client)
    return client


def delete_client(db: Session, client_id: int) -> bool:
    client = get_client_by_id(db, client_id)
    if not client:
        return False
    client.activo = False
    db.commit()
    return True