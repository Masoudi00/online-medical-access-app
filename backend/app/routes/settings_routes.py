from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.user import UserSettings
from config.database import get_db
from config.security import get_current_user
from app.models import UserAccount

router = APIRouter(
    prefix="/settings",
    tags=["settings"]
)

@router.put("/language", response_model=UserSettings)
async def update_language(
    settings: UserSettings,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get a fresh instance of the user from the current session
    db_user = db.query(UserAccount).filter(UserAccount.id == current_user.id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db_user.language = settings.language
    if settings.theme:
        db_user.theme = settings.theme
    
    db.commit()
    
    return UserSettings(
        language=db_user.language,
        theme=db_user.theme
    ) 