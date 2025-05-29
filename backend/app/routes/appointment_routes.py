from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.controllers import appointment as appointment_crud
from app.schemas import Appointment, AppointmentCreate, AppointmentUpdate
from config.database import get_db
from config.security import get_current_user
from app.models import UserAccount

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"]
)

@router.post("/create", response_model=Appointment)
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    return appointment_crud.create_appointment(db=db, appointment=appointment, user_id=current_user.id)

@router.get("/list", response_model=List[Appointment])
def read_appointments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    appointments = appointment_crud.get_user_appointments(db, user_id=current_user.id, skip=skip, limit=limit)
    return appointments

@router.get("/get/{appointment_id}", response_model=Appointment)
def read_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    db_appointment = appointment_crud.get_appointment(db, appointment_id=appointment_id)
    if db_appointment is None or db_appointment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

@router.put("/update/{appointment_id}", response_model=Appointment)
def update_appointment(
    appointment_id: int,
    appointment: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    db_appointment = appointment_crud.get_appointment(db, appointment_id=appointment_id)
    if db_appointment is None or db_appointment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment_crud.update_appointment(db=db, appointment_id=appointment_id, appointment=appointment)

@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_appointment = appointment_crud.get_appointment(db, appointment_id=appointment_id)
    if db_appointment is None or db_appointment.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment_crud.delete_appointment(db=db, appointment_id=appointment_id):
        return {"message": "Appointment deleted successfully"}
    raise HTTPException(status_code=500, detail="Error deleting appointment") 