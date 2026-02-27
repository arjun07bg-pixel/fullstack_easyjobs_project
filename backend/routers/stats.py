from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.dependencies import get_db
from backend.models.user import User
from backend.models.company import Company
from backend.models.job import Job
from backend.models.admin import Admin

router = APIRouter(prefix="/admin/stats", tags=["Admin Stats"])

@router.get("/")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.role == "jobseeker").count()
    total_recruiters = db.query(User).filter(User.role == "employer").count()
    total_jobs = db.query(Job).count()
    
    # Pending approvals (Companies & Jobs)
    pending_companies = db.query(Company).filter(Company.status == "pending").count()
    pending_jobs = db.query(Job).filter(Job.status == "pending").count()
    
    return {
        "total_users": total_users,
        "total_recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "pending_approvals": pending_companies + pending_jobs,
        "pending_companies": pending_companies,
        "pending_jobs": pending_jobs
    }
