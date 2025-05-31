from sqlalchemy.orm import Session
from app.models.user import UserAccount
from app.schemas.user import UserProfileUpdate
from fastapi import HTTPException, status
import os
from datetime import datetime

def get_user_profile(db: Session, user_id: int):
    return db.query(UserAccount).filter(UserAccount.id == user_id).first()

def update_user_profile(db: Session, user_id: int, profile_update: UserProfileUpdate):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    
    # Update user fields from the profile update
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

def update_profile_picture(db: Session, user_id: int, profile_picture_path: str):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    user.profile_picture = profile_picture_path
    db.commit()
    db.refresh(user)
    return user 