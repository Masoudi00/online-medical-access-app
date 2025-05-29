from fastapi import Depends, HTTPException
from app.models import UserAccount
from config.security import get_current_user

async def get_admin_user(current_user: UserAccount = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user
