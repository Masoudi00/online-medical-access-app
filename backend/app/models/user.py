from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

class UserAccount(Base):
    __tablename__ = "user_account"

    id = Column(Integer, primary_key=True, index=True)
    cin = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    gender = Column(String)
    password = Column(String, nullable=False)
    phone = Column(String)
    profile_picture = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    #settings 

    language = Column(String, default="en")
    theme = Column(String, default="light")

    
    appointments = relationship("Appointment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

    role = Column(String, nullable=False, default="user")

    @property
    def is_admin(self):
        return self.role == "admin"

