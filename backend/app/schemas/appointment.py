from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .user import UserProfile
from .document import Document

class AppointmentBase(BaseModel):
    appointment_date: datetime
    reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(AppointmentBase):
    status: Optional[str] = None
    rejection_reason: Optional[str] = None

class PatientDetails(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_id: Optional[str] = None
    documents: List[Document] = []

    class Config:
        from_attributes = True

class Appointment(AppointmentBase):
    id: int
    user_id: int
    doctor_id: Optional[int] = None
    status: str
    created_at: datetime
    rejection_reason: Optional[str] = None
    user: Optional[PatientDetails] = None
    doctor: Optional[UserProfile] = None

    class Config:
        from_attributes = True
