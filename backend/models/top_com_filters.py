
from sqlalchemy import Column, Integer, String
from database.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)

    location = Column(String, nullable=False)
    experience_level = Column(String, nullable=False)

    job_function = Column(String, nullable=False)
    work_mode = Column(String, nullable=False)
    job_type = Column(String, nullable=False)
