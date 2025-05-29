from sqlalchemy.orm import Session
from app.models.user import UserAccount
from app.models.appointment import Appointment

from app.schemas.user import UserCreate
from config.security import hash_password
from datetime import datetime




def create_user(db:Session, user: UserCreate):
    user_data = user.dict()
    user_data["password"] = hash_password(user.password)
    db_user = UserAccount(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(UserAccount).filter(UserAccount.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(UserAccount).offset(skip).limit(limit).all()


def get_user_by_email(db: Session, email: str):
    return db.query(UserAccount).filter(UserAccount.email == email).first()

