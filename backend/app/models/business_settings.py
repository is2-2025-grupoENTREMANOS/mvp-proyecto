from sqlalchemy import Column, Integer, String, Numeric, Time
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.core.database import Base


class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id                      = Column(Integer, primary_key=True, index=True)
    opening_time            = Column(String(5), default="09:00")   # "HH:MM"
    closing_time            = Column(String(5), default="19:00")   # "HH:MM"
    slot_duration           = Column(Integer,   default=60)        # minutos
    min_advance_hours       = Column(Integer,   default=2)
    minimum_deposit_percent = Column(Numeric(5,2), default=50.00)
    created_at              = Column(DateTime(timezone=True), server_default=func.now())
    updated_at              = Column(DateTime(timezone=True), onupdate=func.now())