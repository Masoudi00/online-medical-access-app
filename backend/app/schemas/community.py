from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    id: int
    first_name: str
    last_name: str
    role: str
    profile_picture: Optional[str] = None

class ReplyBase(BaseModel):
    content: str

class ReplyCreate(ReplyBase):
    pass

class ReplyResponse(ReplyBase):
    id: int
    created_at: datetime
    user: UserBase

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    likes: int
    created_at: datetime
    user: UserBase
    replies: List[ReplyResponse]

    class Config:
        from_attributes = True 