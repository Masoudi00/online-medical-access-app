from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate

def create_notification(db: Session, user_id: int, notif: NotificationCreate):
    db_notif = Notification(user_id=user_id, message=notif.message)
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def get_user_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

def mark_notification_as_read(db: Session, notif_id: int):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif

def delete_all_user_notifications(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id).delete()
    db.commit()
    return True
