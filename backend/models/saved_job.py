from sqlalchemy import Column, Integer, ForeignKey, DateTime
from database.database import Base
from datetime import datetime

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)
