from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business_settings import BusinessSettings
from app.schemas.business_settings import BusinessSettingsUpdate, BusinessSettingsResponse
from app.routers.auth import require_admin
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["Configuración"])


def get_or_create_settings(db: Session) -> BusinessSettings:
    settings = db.query(BusinessSettings).first()
    if not settings:
        settings = BusinessSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/business", response_model=BusinessSettingsResponse)
def get_business_settings(db: Session = Depends(get_db)):
    return get_or_create_settings(db)


@router.put("/business", response_model=BusinessSettingsResponse)
def update_business_settings(
    data: BusinessSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    settings = get_or_create_settings(db)
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(settings, campo, valor)
    db.commit()
    db.refresh(settings)
    return settings