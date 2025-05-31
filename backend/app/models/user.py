from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
from datetime import datetime

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
    insurance_provider = Column(String, nullable=True)
    insurance_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    #settings 

    language = Column(String, default="en")
    theme = Column(String, default="light")

    
    appointments_as_patient = relationship("Appointment", foreign_keys="[Appointment.user_id]", back_populates="user")
    appointments_as_doctor = relationship("Appointment", foreign_keys="[Appointment.doctor_id]", back_populates="doctor")
    notifications = relationship("Notification", back_populates="user", foreign_keys="[Notification.user_id]", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    replies = relationship("Reply", back_populates="user", cascade="all, delete-orphan")

    role = Column(String, nullable=False, default="user")

    @property
    def is_admin(self):
        return self.role == "admin"

    @property
    def is_doctor(self):
        return self.role == "doctor"

