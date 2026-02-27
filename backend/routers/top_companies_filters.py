
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy import func

from backend.dependencies import get_db
from backend.models.job import Job
from backend.schemas.job import JobOut

router = APIRouter(
    prefix="/jobs",
    tags=["top-companies_Filters"]
)


@router.get("/filter", response_model=List[JobOut])
def filter_jobs(
    location: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    job_function: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Job)

    if location:
        query = query.filter(func.lower(Job.location) == location.lower())

    if experience_level:
        query = query.filter(func.lower(Job.experience_level) == experience_level.lower())

    if job_function:
        query = query.filter(func.lower(Job.job_function) == job_function.lower())

    if work_mode:
        query = query.filter(func.lower(Job.work_mode) == work_mode.lower())

    if job_type:
        query = query.filter(func.lower(Job.job_type) == job_type.lower())

    return query.all()


