from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Optional

class NotificationType(str, Enum):
    LIKE = "like"
    REPLY = "reply"
    NESTED_REPLY = "nested_reply"
    POST_DELETION = "post_deletion"
    COMMENT_DELETION = "comment_deletion"
    APPOINTMENT_REMINDER = "appointment_reminder"
    PRESCRIPTION_UPDATE = "prescription_update"
    TEST_RESULTS = "test_results"
    SYSTEM = "system"

class NotificationCreate(BaseModel):
    message: str
    type: NotificationType = NotificationType.SYSTEM
    link: Optional[str] = None  # URL to redirect to when clicking the notification
    notification_metadata: Optional[dict] = None  # Additional data specific to notification type

class NotificationOut(BaseModel):
    id: int
    message: str
    type: NotificationType
    link: Optional[str]
    notification_metadata: Optional[dict]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True



