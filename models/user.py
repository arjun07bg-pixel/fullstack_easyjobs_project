from sqlalchemy import Column, Integer, String, Text
from database.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # hashed password
    phone_number = Column(String(20), nullable=False)
    role = Column(String(50), nullable=False)
    image = Column(Text, nullable=True) # Text to allow long base64 strings
    bio = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True) # in years
    salary = Column(Integer, nullable=True) # in LPA
    skills = Column(Text, nullable=True) # comma separated
    resume_url = Column(Text, nullable=True)
    
    # New Fields for Comprehensive Profile
    education = Column(Text, nullable=True) # JSON or comma separated details
    projects = Column(Text, nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    dob = Column(String(50), nullable=True)
    designation = Column(String(100), nullable=True)





