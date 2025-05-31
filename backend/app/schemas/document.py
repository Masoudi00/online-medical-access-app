from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    name: str
    content_type: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    user_id: int
    file_path: str
    timestamp: str
    created_at: datetime

    class Config:
        from_attributes = True 