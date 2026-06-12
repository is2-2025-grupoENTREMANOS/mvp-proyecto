from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class BusinessSettingsUpdate(BaseModel):
    opening_time:            Optional[str]     = Field(None, pattern=r"^\d{2}:\d{2}$")
    closing_time:            Optional[str]     = Field(None, pattern=r"^\d{2}:\d{2}$")
    slot_duration:           Optional[int]     = Field(None, gt=0)
    min_advance_hours:       Optional[int]     = Field(None, ge=0)
    minimum_deposit_percent: Optional[Decimal] = Field(None, ge=0, le=100)


class BusinessSettingsResponse(BaseModel):
    id:                      int
    opening_time:            str
    closing_time:            str
    slot_duration:           int
    min_advance_hours:       int
    minimum_deposit_percent: Decimal

    model_config = {"from_attributes": True}