from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    cin: str
    first_name: str
    last_name: str
    email: str
    gender: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "user"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

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
    role: Optional[str] = "user"
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "user"
    bio: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

    


class UserUpdateSettings(BaseModel):
    language: str
    theme: str