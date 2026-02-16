from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database.database import Base
from datetime import datetime

class Application(Base):
    __tablename__ = "applications"

    application_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    company_name = Column(String, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    portfolio_link = Column(String, nullable=False)
    resume = Column(String, nullable=False)
    Current_Location = Column(String, nullable=False)
    Total_Experience = Column(Integer, nullable=False)
    Current_salary = Column(Integer, nullable=False)
    Notice_Period = Column(Integer, nullable=False)
    Cover_Letter = Column(String, nullable=False)
     




    
