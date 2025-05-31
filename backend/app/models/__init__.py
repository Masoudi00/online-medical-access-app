from config.database import Base
from .user import UserAccount
from .appointment import Appointment
from .document import Document
from .comment import Comment, Reply
from .notification import Notification

__all__ = [
    "UserAccount",
    "Appointment",
    "Document",
    "Comment",
    "Reply",
    "Notification"
]
