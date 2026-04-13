from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SavedJobBase(BaseModel):
    user_id: int
    job_id: int

class SavedJobCreate(SavedJobBase):
    pass

class SavedJobOut(SavedJobBase):
    id: int
    saved_at: datetime

    class Config:
        from_attributes = True
