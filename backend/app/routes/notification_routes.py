from fastapi import APIRouter, Depends, HTTPException
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
def get_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return notification_service.get_user_notifications(db, user_id=current_user.id)

@router.put("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    result = notification_service.mark_as_read(db, notification_id=notification_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.delete("/clear-all")
def clear_all(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notification_service.clear_all_notifications(db, user_id=current_user.id)
    return {"status": "success"}

# Internal routes used by other services
@router.post("/internal/like", response_model=NotificationOut)
def create_like_notification(
    post_author_id: int,
    post_title: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return notification_service.create_like_notification(
        db, 
        post_author_id=post_author_id,
        liker=current_user,
        post_title=post_title
    )

@router.post("/internal/reply", response_model=NotificationOut)
def create_reply_notification(
    post_author_id: int,
    post_title: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return notification_service.create_reply_notification(
        db,
        post_author_id=post_author_id,
        replier=current_user,
        post_title=post_title
    )

@router.post("/internal/nested-reply", response_model=NotificationOut)
def create_nested_reply_notification(
    comment_author_id: int,
    post_title: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return notification_service.create_nested_reply_notification(
        db,
        comment_author_id=comment_author_id,
        replier=current_user,
        post_title=post_title
    )

@router.post("/internal/post-deletion", response_model=NotificationOut)
def create_post_deletion_notification(
    post_author_id: int,
    post_title: str,
    reason: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can send deletion notifications")
    return notification_service.create_post_deletion_notification(
        db,
        post_author_id=post_author_id,
        admin=current_user,
        post_title=post_title,
        reason=reason
    )

@router.post("/internal/comment-deletion", response_model=NotificationOut)
def create_comment_deletion_notification(
    comment_author_id: int,
    post_title: str,
    reason: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can send deletion notifications")
    return notification_service.create_comment_deletion_notification(
        db,
        comment_author_id=comment_author_id,
        admin=current_user,
        post_title=post_title,
        reason=reason
    )
