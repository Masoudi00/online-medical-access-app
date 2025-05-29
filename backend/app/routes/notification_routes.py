from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from app.services import notification_service
from app.schemas.notification import NotificationCreate, NotificationOut
from config.security import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/", response_model=NotificationOut)
def create(user_notification: NotificationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return notification_service.create_notification(db, user_id=current_user.id, notif=user_notification)

@router.get("/", response_model=list[NotificationOut])
def read(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return notification_service.get_user_notifications(db, user_id=current_user.id)

@router.put("/{notif_id}/read", response_model=NotificationOut)
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    return notification_service.mark_notification_as_read(db, notif_id=notif_id)

@router.delete("/clear-all")
def clear_all(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notification_service.delete_all_user_notifications(db, user_id=current_user.id)
    return {"message": "All notifications cleared successfully"}
