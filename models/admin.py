from sqlalchemy import Column, Integer, String
from database.database import Base

class Admin(Base):
    __tablename__ = "admins"

    admin_id = Column(Integer, primary_key=True, index=True)
    admin_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    
    phone_number = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(String(600), nullable=False)
