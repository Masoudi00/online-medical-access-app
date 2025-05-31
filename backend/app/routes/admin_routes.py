from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from app.middleware.admin import get_admin_user
from app.models import Appointment, UserAccount, Comment, Reply, Notification
from config.database import get_db
from pydantic import BaseModel
from app.services import notification_service
from app.schemas.notification import NotificationCreate
from app.schemas.user import UserResponse
from config.security import get_current_user

class RejectionReason(BaseModel):
    reason: str

class UserRoleUpdate(BaseModel):
    role: str

class AppointmentConfirmation(BaseModel):
    doctor_id: int

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/doctors")
def list_doctors(admin: UserAccount = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(UserAccount).filter(UserAccount.role == "doctor").all()

@router.get("/appointments")
def list_appointments(admin: UserAccount = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(Appointment).all()

@router.put("/appointments/{appointment_id}/confirm")
def confirm_appointment(
    appointment_id: int,
    confirmation: AppointmentConfirmation,
    admin: UserAccount = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Get the appointment
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Get the doctor
    doctor = db.query(UserAccount).filter(UserAccount.id == confirmation.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    if doctor.role != "doctor":
        raise HTTPException(status_code=400, detail="Selected user is not a doctor")
    
    # Update appointment
    appointment.status = "confirmed"
    appointment.doctor_id = doctor.id
    db.commit()
    
    # Create notification for the patient
    patient_notification = NotificationCreate(
        message=f"Your appointment scheduled for {appointment.appointment_date.strftime('%B %d, %Y at %I:%M %p')} has been confirmed with Dr. {doctor.first_name} {doctor.last_name}."
    )
    notification_service.create_notification(db, user_id=appointment.user_id, notif=patient_notification)
    
    # Create notification for the doctor
    doctor_notification = NotificationCreate(
        message=f"You have been assigned to an appointment on {appointment.appointment_date.strftime('%B %d, %Y at %I:%M %p')} with {appointment.user.first_name} {appointment.user.last_name}."
    )
    notification_service.create_notification(db, user_id=doctor.id, notif=doctor_notification)
    
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

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    admin: UserAccount = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    # Create notification for the user
    notification = NotificationCreate(
        message=f"Your account role has been updated to {role_update.role}."
    )
    notification_service.create_notification(db, user_id=user.id, notif=notification)
    
    return user

@router.delete("/users/{user_id}/ban")
async def ban_user(
    user_id: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    # Check if the current user is an admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can ban users"
        )
    
    # Get the user to be banned
    user_to_ban = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user_to_ban:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admins from banning other admins or themselves
    if user_to_ban.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot ban administrators"
        )
    
    if user_to_ban.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot ban yourself"
        )

    try:
        # Delete all notifications related to the user
        db.query(Notification).filter(
            (Notification.user_id == user_id) | 
            (Notification.actor_id == user_id)
        ).delete(synchronize_session=False)

        # Delete all replies by the user
        db.query(Reply).filter(Reply.user_id == user_id).delete(synchronize_session=False)
        
        # Delete all comments by the user
        db.query(Comment).filter(Comment.user_id == user_id).delete(synchronize_session=False)
        
        # Finally, delete the user account
        db.delete(user_to_ban)
        db.commit()

        return {"message": f"User {user_to_ban.first_name} {user_to_ban.last_name} has been banned and all their data has been removed"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while banning the user: {str(e)}"
        )

