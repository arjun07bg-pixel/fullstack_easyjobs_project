from sqlalchemy import Column, Integer, String, Text
from database.database import Base

class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(150), nullable=False)
    company_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    experience_level = Column(Integer, nullable=True)  # years
    job_type = Column(String(50), nullable=True)       # Full-time / Part-time
    salary = Column(Integer, nullable=True)            # INR
    work_mode = Column(String(50), nullable=True)      # Remote / Onsite / Hybrid
