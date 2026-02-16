# from pydantic import BaseModel
# from typing import Optional

# class JobBase(BaseModel):
#     job_title: str
#     company_name: str
#     description: Optional[str]
#     location: Optional[str]
#     experience_level: Optional[int]
#     job_type: Optional[str]
#     salary: Optional[int]
#     work_mode: Optional[str]

# class JobCreate(JobBase):
#     pass

# class JobOut(JobBase):
#     job_id: int

#     class Config:
#         from_attributes = True



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


# ---------------- RESPONSE ----------------
class JobOut(JobBase):
    job_id: int

    class Config:
        from_attributes = True
