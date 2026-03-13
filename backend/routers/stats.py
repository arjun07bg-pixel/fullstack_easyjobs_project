from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.database import get_db
from models.user import User
from models.company import Company
from models.job import Job
from models.admin import Admin
from models.application import Application

router = APIRouter(prefix="/admin/stats", tags=["Admin Stats"])

@router.get("/")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users      = db.query(User).filter(User.role == "jobseeker").count()
    total_recruiters = db.query(User).filter(User.role == "employer").count()
    total_jobs       = db.query(Job).count()
    total_apps       = db.query(Application).count()
    total_views      = db.query(func.sum(Job.views)).scalar() or 0

    # Pending approvals
    pending_companies = db.query(Company).filter(Company.status == "pending").count()
    pending_jobs      = db.query(Job).filter(Job.status == "pending").count()

    # Applications by status
    shortlisted = db.query(Application).filter(Application.status == "shortlisted").count()
    rejected    = db.query(Application).filter(Application.status == "rejected").count()
    interview   = db.query(Application).filter(Application.status == "interview").count()

    return {
        "total_users":       total_users,
        "total_recruiters":  total_recruiters,
        "total_jobs":        total_jobs,
        "total_applications": total_apps,
        "total_views":       total_views,
        "pending_approvals": pending_companies + pending_jobs,
        "pending_companies": pending_companies,
        "pending_jobs":      pending_jobs,
        "shortlisted":       shortlisted,
        "rejected":          rejected,
        "interview":         interview
    }


# ── Company-wise Application Stats ──────────────────────────
@router.get("/company/{company_name}")
def get_company_stats(company_name: str, db: Session = Depends(get_db)):
    """
    A specific company's analytics:
    - How many people applied
    - Breakdown by status
    - Applications per job title
    """
    apps = db.query(Application)\
        .filter(Application.company_name == company_name)\
        .all()

    total = len(apps)
    shortlisted = sum(1 for a in apps if a.status == "shortlisted")
    rejected    = sum(1 for a in apps if a.status == "rejected")
    interview   = sum(1 for a in apps if a.status == "interview")
    hired       = sum(1 for a in apps if a.status == "hired")
    under_review = total - shortlisted - rejected - interview - hired

    # Total Views for this company
    total_views = db.query(func.sum(Job.views))\
        .filter(Job.company_name == company_name)\
        .scalar() or 0

    # Group by job title
    job_counts = {}
    for a in apps:
        title = a.job_title or "Unknown"
        job_counts[title] = job_counts.get(title, 0) + 1

    top_jobs = sorted(job_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "company_name":  company_name,
        "total_applied": total,
        "total_views":   total_views,
        "under_review":  under_review,
        "shortlisted":   shortlisted,
        "interview":     interview,
        "hired":         hired,
        "rejected":      rejected,
        "top_job_titles": [{"job_title": t, "count": c} for t, c in top_jobs]
    }


# ── All Companies Ranked by Applications ─────────────────────
@router.get("/companies/ranking")
def get_company_rankings(db: Session = Depends(get_db)):
    results = db.query(
        Application.company_name,
        func.count(Application.application_id).label("total_applied")
    ).group_by(Application.company_name)\
     .order_by(func.count(Application.application_id).desc())\
     .limit(10)\
     .all()

    return [{"company_name": r.company_name, "total_applied": r.total_applied} for r in results]
