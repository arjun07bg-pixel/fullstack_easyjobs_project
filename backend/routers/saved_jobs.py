from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.saved_job import SavedJob
from models.job import Job
from schemas.saved_job import SavedJobCreate, SavedJobOut

router = APIRouter(prefix="/saved-jobs", tags=["Saved Jobs"])

@router.post("/", response_model=SavedJobOut, status_code=status.HTTP_201_CREATED)
def save_job(saved_job: SavedJobCreate, db: Session = Depends(get_db)):
    # Verify job exists first
    job = db.query(Job).filter(Job.job_id == saved_job.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="This job no longer exists in our database.\nஇந்த வேலை தற்போது தரவுதளத்தில் இல்லை.")

    # Check if already saved
    existing = db.query(SavedJob).filter(
        SavedJob.user_id == saved_job.user_id,
        SavedJob.job_id == saved_job.job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Job already saved")
    
    new_saved = SavedJob(**saved_job.dict())
    db.add(new_saved)
    db.commit()
    db.refresh(new_saved)

    # ── Notification for job saved ────────────────────────────
    try:
        from models.notification import Notification
        notif = Notification(
            user_id=saved_job.user_id,
            title="Job Saved! 📌",
            message=f"You saved '{job.job_title}' at {job.company_name}. You can find it in your Saved Jobs list.\n'{job.job_title}' வேலை உங்கள் சேமிக்கப்பட்ட பட்டியல் சேர்க்கப்பட்டது.",
            type="info"
        )
        db.add(notif)
        db.commit()
    except Exception as e:
        print(f"⚠️ Saved job notification failed: {e}")

    return new_saved

@router.get("/{user_id}", response_model=list[dict])
def get_saved_jobs(user_id: int, db: Session = Depends(get_db)):
    # Join with Job table to get details
    results = db.query(Job).join(
        SavedJob, Job.job_id == SavedJob.job_id
    ).filter(SavedJob.user_id == user_id).all()
    
    # Manually convert to list of dicts to include job details
    return [
        {
            "job_id": job.job_id,
            "job_title": job.job_title,
            "company_name": job.company_name,
            "location": job.location,
            "job_type": job.job_type,
            "salary": job.salary,
            "work_mode": job.work_mode
        } for job in results
    ]

@router.delete("/{user_id}/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_job(user_id: int, job_id: int, db: Session = Depends(get_db)):
    saved = db.query(SavedJob).filter(
        SavedJob.user_id == user_id,
        SavedJob.job_id == job_id
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")
    
    db.delete(saved)
    db.commit()
