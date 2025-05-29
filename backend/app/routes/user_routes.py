from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.controllers import user as user_crud
from app.schemas import UserResponse, UserCreate, User
from config.database import get_db
from config.security import get_current_user
from app.models import UserAccount
from app.schemas.user import UserUpdateSettings

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/create", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if CIN already exists
    db_user = db.query(UserAccount).filter(UserAccount.cin == user.cin).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CIN already registered"
        )
    
    return user_crud.create_user(db, user)

@router.get("/get/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = user_crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/list", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return user_crud.get_users(db, skip=skip, limit=limit)

@router.get("/me", response_model=User)
def read_users_me(current_user: UserAccount = Depends(get_current_user)):
    return current_user 





#settings

@router.get("/settings", response_model=UserUpdateSettings)
def Update_settings(
    settings = UserUpdateSettings,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user),
):
    current_user.language = settings.language
    current_user.theme = settings.theme
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return settings

