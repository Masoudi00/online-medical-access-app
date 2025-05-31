from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from config.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_account.id", ondelete="CASCADE"))
    actor_id = Column(Integer, ForeignKey("user_account.id", ondelete="SET NULL"), nullable=True)
    type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    link = Column(String, nullable=True)
    notification_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Integer, default=0)

    # Relationships
    user = relationship("UserAccount", foreign_keys=[user_id], back_populates="notifications")
    actor = relationship("UserAccount", foreign_keys=[actor_id])

    
    