from pydantic import BaseModel
from datetime import datetime 

class NotificationCreate(BaseModel):
    message: str

class NotificationOut(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True



