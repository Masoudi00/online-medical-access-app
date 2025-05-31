from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserInfo(BaseModel):
    id: int
    first_name: str
    last_name: str
    profile_picture: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class ReplyBase(BaseModel):
    content: str

class ReplyCreate(ReplyBase):
    pass

class ReplyResponse(ReplyBase):
    id: int
    comment_id: int
    user_id: int
    created_at: datetime
    user: UserInfo

    class Config:
        from_attributes = True

class CommentResponse(CommentBase):
    id: int
    user_id: int
    likes: int
    created_at: datetime
    replies: List[ReplyResponse] = []
    user: UserInfo
    is_liked: bool = False

    class Config:
        from_attributes = True

    @staticmethod
    def compute_is_liked(comment, current_user):
        return current_user in comment.liked_by 