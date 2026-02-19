from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApplicationCreate(BaseModel):
    user_id:          int
    job_id:           Optional[int]    = None
    company_name:     str
    job_title:        Optional[str]    = None
    name:             str
    email:            str
    phone_number:     str
    portfolio_link:   Optional[str]    = ""
    resume:           Optional[str]    = ""
    Current_Location: Optional[str]    = ""
    Total_Experience: Optional[int]    = 0
    Current_salary:   Optional[int]    = 0
    Notice_Period:    Optional[int]    = 0
    Cover_Letter:     Optional[str]    = ""
    status:           Optional[str]    = "applied"


class ApplicationOut(BaseModel):
    application_id:   int
    user_id:          int
    job_id:           Optional[int]    = None
    company_name:     str
    job_title:        Optional[str]    = None
    name:             str
    email:            str
    phone_number:     str
    portfolio_link:   Optional[str]    = ""
    resume:           Optional[str]    = ""
    Current_Location: Optional[str]    = ""
    Total_Experience: Optional[int]    = 0
    Current_salary:   Optional[int]    = 0
    Notice_Period:    Optional[int]    = 0
    Cover_Letter:     Optional[str]    = ""
    status:           Optional[str]    = "applied"
    applied_at:       Optional[datetime] = None

    class Config:
        from_attributes = True
