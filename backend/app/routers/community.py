from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.community import Comment, Reply
from app.models.user import User
from app.schemas.community import CommentCreate, ReplyCreate, CommentResponse, ReplyResponse
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/community",
    tags=["community"]
)

@router.get("/comments", response_model=List[CommentResponse])
def get_comments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Get all comments with their replies, ordered by most recent first"""
    comments = db.query(Comment)\
        .order_by(Comment.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return comments

@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment"""
    db_comment = Comment(
        content=comment.content,
        user_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.post("/comments/{comment_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply(
    comment_id: int,
    reply: ReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a reply to a comment"""
    # Check if comment exists
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    db_reply = Reply(
        content=reply.content,
        comment_id=comment_id,
        user_id=current_user.id
    )
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    return db_reply

@router.post("/comments/{comment_id}/like")
def like_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Like a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    comment.likes += 1
    db.commit()
    return {"message": "Comment liked successfully"} 