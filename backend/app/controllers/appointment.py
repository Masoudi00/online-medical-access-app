from sqlalchemy.orm import Session
from app.models import UserAccount, Appointment
from app.schemas import UserCreate, AppointmentCreate, AppointmentUpdate
from config.security import hash_password
from datetime import datetime

def create_appointment(db: Session, appointment: AppointmentCreate, user_id: int):
    db_appointment = Appointment(**appointment.dict(), user_id=user_id)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def get_appointment(db: Session, appointment_id: int):
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def get_user_appointments(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Appointment).filter(Appointment.user_id == user_id).offset(skip).limit(limit).all()

def update_appointment(db: Session, appointment_id: int, appointment: AppointmentUpdate):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        update_data = appointment.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
        return True
    return False
