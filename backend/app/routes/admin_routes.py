from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.middleware.admin import get_admin_user
from app.models import Appointment, UserAccount
from config.database import get_db
from pydantic import BaseModel
from app.services import notification_service
from app.schemas.notification import NotificationCreate

class RejectionReason(BaseModel):
    reason: str

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/appointments")
def list_appointments(admin: UserAccount = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(Appointment).all()

@router.put("/appointments/{appointment_id}/confirm")
def confirm_appointment(appointment_id: int, admin: UserAccount = Depends(get_admin_user), db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = "confirmed"
    db.commit()
    
    # Create notification for the user
    notification = NotificationCreate(
        message=f"Your appointment scheduled for {appointment.appointment_date.strftime('%B %d, %Y at %I:%M %p')} has been confirmed."
    )
    notification_service.create_notification(db, user_id=appointment.user_id, notif=notification)
    
    return {"message": "Appointment confirmed successfully"}

@router.put("/appointments/{appointment_id}/reject")
def reject_appointment(
    appointment_id: int, 
    rejection_data: RejectionReason,
    admin: UserAccount = Depends(get_admin_user), 
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = "rejected"
    appointment.rejection_reason = rejection_data.reason
    db.commit()
    
    # Create notification for the user
    notification = NotificationCreate(
        message=f"Your appointment scheduled for {appointment.appointment_date.strftime('%B %d, %Y at %I:%M %p')} has been rejected. Reason: {rejection_data.reason}"
    )
    notification_service.create_notification(db, user_id=appointment.user_id, notif=notification)
    
    return {"message": "Appointment rejected successfully"}

@router.get("/users")
def list_users(admin: UserAccount = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(UserAccount).all()

@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, admin: UserAccount = Depends(get_admin_user), db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}

