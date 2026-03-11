 


from sqlalchemy import Column, Integer, String
from database.database import Base

class Filter(Base):
    
    __tablename__ = "filters"

    filter_id = Column(Integer, primary_key=True, index=True)
    search_keywords = Column(String(150), nullable=True)
    location = Column(String(150), nullable=True)
    experience_level = Column(Integer, nullable=True)
    job_type = Column(String(100), nullable=True)
    salary_range = Column(Integer, nullable=True)
    work_mode = Column(String(50), nullable=True)
