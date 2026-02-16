
from pydantic import BaseModel
from typing import Optional

class FilterCreate(BaseModel):
    search_keywords: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[int] = None
    job_type: Optional[str] = None
    salary_range: Optional[int] = None
    work_mode: Optional[str] = None

class FilterOut(FilterCreate):
    filter_id: int

    class Config:
        from_attributes = True
