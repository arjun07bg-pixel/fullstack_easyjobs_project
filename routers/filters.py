
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from dependencies import get_db
from models.job import Job
from schemas.job import JobOut

router = APIRouter(prefix="/filters", tags=["Filters - Findjobs"])

# ---------------- GET FILTERED JOBS ----------------
@router.get("/jobs", response_model=List[JobOut])
def filter_jobs(
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    experience_level: Optional[int] = None,
    job_type: Optional[str] = None,
    salary_range: Optional[int] = None,
    work_mode: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Job)

    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if keyword:
        query = query.filter(Job.job_title.ilike(f"%{keyword}%") | Job.description.ilike(f"%{keyword}%"))
    if salary_range:
        query = query.filter(Job.salary <= salary_range)
    if work_mode:
        query = query.filter(Job.work_mode == work_mode)
    
    

    return query.offset(skip).limit(limit).all()
