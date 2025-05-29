from sqlalchemy.orm import Session
from app.models.user import UserAccount
from app.schemas.user import UserProfileUpdate
from fastapi import HTTPException, status
import os
from datetime import datetime

def get_user_profile(db: Session, user_id: int):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def update_user_profile(db: Session, user_id: int, profile_update: UserProfileUpdate):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update only the fields that are provided
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def update_profile_picture(db: Session, user_id: int, picture_path: str):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete old profile picture if it exists
    if user.profile_picture and os.path.exists(user.profile_picture):
        try:
            os.remove(user.profile_picture)
        except Exception as e:
            print(f"Error deleting old profile picture: {e}")
    
    user.profile_picture = picture_path
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user 