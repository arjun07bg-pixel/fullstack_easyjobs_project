from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from database.database import Base
from datetime import datetime

class Application(Base):
    __tablename__ = "applications"

    application_id   = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    job_id           = Column(Integer, nullable=True)          # soft FK – no crash if job deleted
    company_name     = Column(String(200), nullable=False)
    job_title        = Column(String(200), nullable=True)      # NEW – job position applied for
    name             = Column(String(150), nullable=False)
    email            = Column(String(150), nullable=False)
    phone_number     = Column(String(30),  nullable=False)
    portfolio_link   = Column(String(500), nullable=True)
    resume           = Column(String(500), nullable=True)
    Current_Location = Column(String(150), nullable=True)
    Total_Experience = Column(Integer,     nullable=True)
    Current_salary   = Column(Integer,     nullable=True)
    Notice_Period    = Column(Integer,     nullable=True)
    Cover_Letter     = Column(Text,        nullable=True)
    status           = Column(String(50),  nullable=True, default="applied")   # NEW
    applied_at       = Column(DateTime,    nullable=True, default=datetime.utcnow)  # NEW
