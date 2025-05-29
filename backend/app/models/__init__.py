from config.database import Base
from .user import UserAccount
from .appointment import Appointment

__all__ = ['Base', 'UserAccount', 'Appointment']
