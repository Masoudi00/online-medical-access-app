from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    cin: str
    first_name: str
    last_name: str
    email: str
    gender: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserResponse(UserCreate):
    id: int

    class Config:
        orm_mode = True


class UserProfile(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    gender: Optional[str]
    phone: Optional[str]
    profile_picture: Optional[str] = None

    class Config:
        from_attributes = True

    
    