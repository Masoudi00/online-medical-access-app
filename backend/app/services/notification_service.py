from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationType
from app.models.user import UserAccount

def create_notification(db: Session, user_id: int, notif: NotificationCreate):
    db_notif = Notification(
        user_id=user_id,
        message=notif.message,
        type=notif.type,
        link=notif.link,
        notification_metadata=notif.notification_metadata
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

def get_user_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

def mark_as_read(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notification:
        notification.is_read = True
        db.commit()
        return notification
    return None

def clear_all_notifications(db: Session, user_id: int):
    db.query(Notification).filter(Notification.user_id == user_id).delete()
    db.commit()

# New notification functions for community interactions
def create_like_notification(db: Session, post_author_id: int, liker: UserAccount, post_title: str):
    role_prefix = f"[{liker.role.upper()}] " if liker.role in ['doctor', 'admin'] else ""
    return create_notification(
        db,
        post_author_id,
        NotificationCreate(
            message=f"{role_prefix}{liker.first_name} {liker.last_name} liked your post: {post_title}",
            type=NotificationType.LIKE,
            link=f"/community/post/{post_title}",  # You'll need to use post_id in practice
            notification_metadata={
                "liker_id": liker.id,
                "liker_name": f"{liker.first_name} {liker.last_name}",
                "liker_role": liker.role,
                "post_title": post_title
            }
        )
    )

def create_reply_notification(db: Session, post_author_id: int, replier: UserAccount, post_title: str):
    role_prefix = f"[{replier.role.upper()}] " if replier.role in ['doctor', 'admin'] else ""
    return create_notification(
        db,
        post_author_id,
        NotificationCreate(
            message=f"{role_prefix}{replier.first_name} {replier.last_name} replied to your post: {post_title}",
            type=NotificationType.REPLY,
            link=f"/community/post/{post_title}",  # You'll need to use post_id in practice
            notification_metadata={
                "replier_id": replier.id,
                "replier_name": f"{replier.first_name} {replier.last_name}",
                "replier_role": replier.role,
                "post_title": post_title
            }
        )
    )

def create_nested_reply_notification(db: Session, comment_author_id: int, replier: UserAccount, post_title: str):
    role_prefix = f"[{replier.role.upper()}] " if replier.role in ['doctor', 'admin'] else ""
    return create_notification(
        db,
        comment_author_id,
        NotificationCreate(
            message=f"{role_prefix}{replier.first_name} {replier.last_name} replied to your comment on: {post_title}",
            type=NotificationType.NESTED_REPLY,
            link=f"/community/post/{post_title}",  # You'll need to use post_id in practice
            notification_metadata={
                "replier_id": replier.id,
                "replier_name": f"{replier.first_name} {replier.last_name}",
                "replier_role": replier.role,
                "post_title": post_title
            }
        )
    )

def create_post_deletion_notification(db: Session, post_author_id: int, admin: UserAccount, post_title: str, reason: str):
    return create_notification(
        db,
        post_author_id,
        NotificationCreate(
            message=f"[ADMIN] Your post '{post_title}' was removed by {admin.first_name} {admin.last_name}. Reason: {reason}",
            type=NotificationType.POST_DELETION,
            notification_metadata={
                "admin_id": admin.id,
                "admin_name": f"{admin.first_name} {admin.last_name}",
                "post_title": post_title,
                "reason": reason
            }
        )
    )

def create_comment_deletion_notification(db: Session, comment_author_id: int, admin: UserAccount, post_title: str, reason: str):
    return create_notification(
        db,
        comment_author_id,
        NotificationCreate(
            message=f"[ADMIN] Your comment on '{post_title}' was removed by {admin.first_name} {admin.last_name}. Reason: {reason}",
            type=NotificationType.COMMENT_DELETION,
            notification_metadata={
                "admin_id": admin.id,
                "admin_name": f"{admin.first_name} {admin.last_name}",
                "post_title": post_title,
                "reason": reason
            }
        )
    )

# Additional helpful notifications
def create_appointment_reminder(db: Session, user_id: int, doctor_name: str, date: str, time: str, appointment_id: int):
    return create_notification(
        db,
        user_id,
        NotificationCreate(
            message=f"Reminder: You have an appointment with Dr. {doctor_name} tomorrow at {time}",
            type=NotificationType.APPOINTMENT_REMINDER,
            link=f"/appointments/{appointment_id}",
            notification_metadata={
                "appointment_id": appointment_id,
                "doctor_name": doctor_name,
                "date": date,
                "time": time
            }
        )
    )

def create_prescription_notification(db: Session, user_id: int, doctor: UserAccount, prescription_id: int):
    return create_notification(
        db,
        user_id,
        NotificationCreate(
            message=f"[DOCTOR] Dr. {doctor.first_name} {doctor.last_name} has updated your prescription",
            type=NotificationType.PRESCRIPTION_UPDATE,
            link=f"/prescriptions/{prescription_id}",
            notification_metadata={
                "doctor_id": doctor.id,
                "doctor_name": f"{doctor.first_name} {doctor.last_name}",
                "prescription_id": prescription_id
            }
        )
    )

def create_test_results_notification(db: Session, user_id: int, doctor: UserAccount, test_id: int):
    return create_notification(
        db,
        user_id,
        NotificationCreate(
            message=f"[DOCTOR] Dr. {doctor.first_name} {doctor.last_name} has uploaded your test results",
            type=NotificationType.TEST_RESULTS,
            link=f"/test-results/{test_id}",
            notification_metadata={
                "doctor_id": doctor.id,
                "doctor_name": f"{doctor.first_name} {doctor.last_name}",
                "test_id": test_id
            }
        )
    )
