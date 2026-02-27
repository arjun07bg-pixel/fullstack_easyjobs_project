from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    phone_number: str = Field(..., min_length=10, max_length=15)
    role: str = Field(..., min_length=1)
    image: str = Field(default="")

class UserSignin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    image: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = None
    salary: Optional[int] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    education: Optional[str] = None
    projects: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    designation: Optional[str] = None

class UserOut(BaseModel):
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    phone_number: str
    role: str
    image: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = None
    salary: Optional[int] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    education: Optional[str] = None
    projects: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    designation: Optional[str] = None

    class Config:
        from_attributes = True









