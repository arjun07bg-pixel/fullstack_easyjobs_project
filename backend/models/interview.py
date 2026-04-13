from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from database.database import Base
from datetime import datetime

class Interview(Base):
    __tablename__ = "interviews"

    id             = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.application_id"), nullable=False)
    interview_date = Column(DateTime, nullable=False)
    location       = Column(String(300), nullable=True)  # Online link or physical address
    notes          = Column(Text, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)
