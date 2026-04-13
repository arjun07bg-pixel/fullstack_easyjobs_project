from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InterviewBase(BaseModel):
    application_id: int
    interview_date: datetime
    location: Optional[str] = None
    notes: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class InterviewOut(InterviewBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
