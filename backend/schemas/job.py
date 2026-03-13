from pydantic import BaseModel
from typing import Optional

# ---------------- BASE ----------------
class JobBase(BaseModel):
    job_title: str
    company_name: str
    description: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[int] = None
    job_type: Optional[str] = None
    salary: Optional[int] = None
    work_mode: Optional[str] = None
    category: Optional[str] = None
    vacancies: Optional[int] = None
    deadline: Optional[str] = None
    company_website: Optional[str] = None
    apply_link: Optional[str] = None
    required_skills: Optional[str] = None
    employer_id: Optional[int] = None


# ---------------- CREATE ----------------
class JobCreate(JobBase):
    pass


# ---------------- UPDATE ----------------
class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[int] = None
    job_type: Optional[str] = None
    salary: Optional[int] = None
    work_mode: Optional[str] = None
    category: Optional[str] = None
    vacancies: Optional[int] = None
    deadline: Optional[str] = None
    company_website: Optional[str] = None
    apply_link: Optional[str] = None
    required_skills: Optional[str] = None
    employer_id: Optional[int] = None


# ---------------- RESPONSE ----------------
class JobOut(JobBase):
    job_id: int

    class Config:
        from_attributes = True
