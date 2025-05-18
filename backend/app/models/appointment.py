from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_account.id"))
    appointment_date = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, cancelled
    reason = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("UserAccount", back_populates="appointments")
    
    