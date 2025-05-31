from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from app.models import UserAccount, Comment, Reply
from app.schemas.comment import CommentCreate, CommentResponse, ReplyCreate, ReplyResponse
from app.services import notification_service
from config.database import get_db
from config.security import get_current_user

router = APIRouter(
    prefix="/community",
    tags=["community"]
)

@router.get("/comments", response_model=List[CommentResponse])
def get_comments(
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    comments = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Reply.user),
            joinedload(Comment.liked_by)
        )
        .order_by(Comment.created_at.desc())
        .all()
    )
    
    # Get the current user from this session to avoid session conflicts
    user_in_session = db.query(UserAccount).filter(UserAccount.id == current_user.id).first()
    return [comment.to_dict(user_in_session) for comment in comments]

@router.post("/comments", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    db_comment = Comment(
        content=comment.content,
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Fetch the comment with user information
    comment_with_user = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Reply.user)
        )
        .filter(Comment.id == db_comment.id)
        .first()
    )
    return comment_with_user

@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    reason: str = None,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user owns the comment or is an admin
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # If an admin is deleting someone else's comment, create a notification
    if current_user.is_admin and comment.user_id != current_user.id:
        notification_service.create_comment_deletion_notification(
            db,
            comment_author_id=comment.user_id,
            admin=current_user,
            post_title=f"Comment: {comment.content[:50]}...",  # Use truncated comment content as title
            reason=reason or "Violated community guidelines"
        )
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}

@router.post("/comments/{comment_id}/replies", response_model=ReplyResponse)
def create_reply(
    comment_id: int,
    reply: ReplyCreate,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    # Check if comment exists
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db_reply = Reply(
        content=reply.content,
        comment_id=comment_id,
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    
    # Create notification for the comment author
    if comment.user_id != current_user.id:  # Don't notify if user replies to their own comment
        notification_service.create_nested_reply_notification(
            db,
            comment_author_id=comment.user_id,
            replier=current_user,
            post_title=f"Comment: {comment.content[:50]}..."  # Use truncated comment content as title
        )
    
    # Fetch the reply with user information
    reply_with_user = (
        db.query(Reply)
        .options(joinedload(Reply.user))
        .filter(Reply.id == db_reply.id)
        .first()
    )
    return reply_with_user

@router.delete("/comments/{comment_id}/replies/{reply_id}")
def delete_reply(
    comment_id: int,
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    reply = db.query(Reply).filter(Reply.id == reply_id, Reply.comment_id == comment_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user owns the reply or is an admin
    if reply.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reply")
    
    db.delete(reply)
    db.commit()
    return {"message": "Reply deleted successfully"}

@router.post("/comments/{comment_id}/like")
def like_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    comment = (
        db.query(Comment)
        .options(
            joinedload(Comment.liked_by),
            joinedload(Comment.user)  # Add this to get comment author info
        )
        .filter(Comment.id == comment_id)
        .first()
    )
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Get the current user from this session
    user_in_session = db.query(UserAccount).filter(UserAccount.id == current_user.id).first()
    
    # Check if user has already liked the comment using IDs for comparison
    already_liked = any(user.id == current_user.id for user in comment.liked_by)
    
    if already_liked:
        # Unlike the comment
        comment.liked_by = [user for user in comment.liked_by if user.id != current_user.id]
        comment.likes = max(0, comment.likes - 1)  # Ensure likes don't go below 0
        message = "Comment unliked successfully"
    else:
        # Like the comment
        comment.liked_by.append(user_in_session)
        comment.likes = comment.likes + 1
        # Create notification for the comment author
        if comment.user_id != current_user.id:  # Don't notify if user likes their own comment
            notification_service.create_like_notification(
                db,
                post_author_id=comment.user_id,
                liker=current_user,
                post_title=f"Comment: {comment.content[:50]}..."  # Use truncated comment content as title
            )
        message = "Comment liked successfully"
    
    db.commit()
    
    return {
        "message": message,
        "likes": comment.likes,
        "is_liked": not already_liked
    } 