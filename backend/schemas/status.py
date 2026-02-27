from pydantic import BaseModel, EmailStr
from enum import Enum


class CandidateStatus(str, Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"


# -------- CREATE --------
class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    job_role: str


# -------- READ (STATUS PAGE RESPONSE) --------
class CandidateStatusOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    job_role: str
    status: CandidateStatus

    class Config:
        from_attributes = True
