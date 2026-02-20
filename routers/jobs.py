
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db
from models.job import Job
from schemas.job import JobCreate, JobUpdate, JobOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    new_job = Job(
        job_title=job.job_title,
        company_name=job.company_name,
        description=job.description,
        location=job.location,
        experience_level=job.experience_level,
        job_type=job.job_type,
        salary=job.salary,
        work_mode=job.work_mode
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job


@router.get("/", response_model=list[JobOut])
def get_jobs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.job_id.desc()).offset(skip).limit(limit).all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job



@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: int, job: JobUpdate, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.job_id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in job.dict(exclude_unset=True).items():
        setattr(db_job, key, value)

    db.commit()
    db.refresh(db_job)
    return db_job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()

