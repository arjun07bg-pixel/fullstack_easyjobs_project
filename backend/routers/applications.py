from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
import sys

# Ensure backend package structure is respected
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database.database import get_db
from models.application import Application
from schemas.application import ApplicationCreate, ApplicationOut
from models.user import User
from models.job import Job
from models.notification import Notification

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)

@router.get("/download/{filename}")
def download_resume(filename: str):
    # This is a placeholder.
    return {"message": f"Resume file '{filename}' exists in the database. Actual file download requires a cloud storage setup."}

@router.post("/", response_model=ApplicationOut)
def apply_job(app: ApplicationCreate, db: Session = Depends(get_db)):
    # 1. Ensure user exists
    existing_user = db.query(User).filter(User.user_id == app.user_id).first()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Your session is no longer valid in our database. Please login again."
        )

    # 2. Check if the Job ID exists in the real database
    #    job_id=0 or None both mean it's a static/company job — store as NULL
    safe_job_id = None
    if app.job_id and app.job_id > 0:
        job_exists = db.query(Job).filter(Job.job_id == app.job_id).first()
        if job_exists:
            safe_job_id = app.job_id
        else:
            print(f"ℹ️ job_id={app.job_id} not in DB — storing as NULL for static job: {app.job_title} at {app.company_name}")

    # 3. Sanitise numeric fields (guard against NaN coming from JS)
    def safe_int(val, default=0):
        try:
            return int(val) if val is not None else default
        except (ValueError, TypeError):
            return default

    try:
        new_application = Application(
            user_id=app.user_id,
            job_id=safe_job_id,
            company_name=app.company_name,
            job_title=app.job_title,
            status=app.status or "applied",
            name=app.name,
            email=app.email,
            phone_number=app.phone_number,
            portfolio_link=app.portfolio_link,
            resume=app.resume,
            Current_Location=app.Current_Location,
            Total_Experience=safe_int(app.Total_Experience),
            Current_salary=safe_int(app.Current_salary),
            Notice_Period=safe_int(app.Notice_Period),
            Cover_Letter=app.Cover_Letter,
            job_type=app.job_type
        )

        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        return new_application
    except Exception as e:
        db.rollback()
        print(f"❌ Application Save Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}."
        )

# ---------------- GET ALL APPLICATIONS ----------------
@router.get("/", response_model=list[ApplicationOut])
def get_applications(db: Session = Depends(get_db)):
    return db.query(Application).all()

# ---------------- GET USER APPLICATIONS ----------------
@router.get("/user/{user_id}", response_model=list[ApplicationOut])
def get_user_applications(
    user_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Application).filter(Application.user_id == user_id).all()

# ---------------- GET SINGLE APPLICATION ----------------
@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.application_id == application_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

# ---------------- UPDATE APPLICATION ----------------
@router.put("/{application_id}", response_model=ApplicationOut)
def update_application(
    application_id: int,
    app: ApplicationCreate,
    db: Session = Depends(get_db)
):
    db_application = db.query(Application).filter(
        Application.application_id == application_id).first()

    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    db_application.user_id = app.user_id
    db_application.job_id = app.job_id
    db_application.company_name = app.company_name
    db_application.job_title = app.job_title
    db_application.status = app.status
    db_application.name = app.name
    db_application.email = app.email
    db_application.phone_number = app.phone_number
    db_application.resume = app.resume
    db_application.job_type = app.job_type

    db.commit()
    db.refresh(db_application)
    return db_application

# ---------------- PARTIAL UPDATE APPLICATION ----------------
@router.patch("/{application_id}", response_model=ApplicationOut)
def patch_application(
    application_id: int,
    updates: dict,
    db: Session = Depends(get_db)
):
    db_application = db.query(Application).filter(
        Application.application_id == application_id).first()

    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    for key, value in updates.items():
        if hasattr(db_application, key):
            setattr(db_application, key, value)

    db.commit()
    db.refresh(db_application)

    # ── Auto Notification when status changes ──────────────────
    new_status = updates.get("status")
    if new_status and db_application.user_id:
        status_messages = {
            "shortlisted": ("🎉 Shortlisted!", f"Congratulations! You have been shortlisted for {db_application.job_title} at {db_application.company_name}."),
            "rejected":    ("Application Update", f"Thank you for applying to {db_application.job_title} at {db_application.company_name}. Unfortunately, you were not selected at this time."),
            "interview":   ("📅 Interview Scheduled!", f"Great news! You have been invited for an interview for {db_application.job_title} at {db_application.company_name}."),
            "hired":       ("🏆 You're Hired!", f"Congratulations! You have been selected for {db_application.job_title} at {db_application.company_name}!")
        }
        if new_status in status_messages:
            title, msg = status_messages[new_status]
            notif = Notification(
                user_id=db_application.user_id,
                title=title,
                message=msg,
                type="success" if new_status in ["shortlisted", "interview", "hired"] else "info"
            )
            db.add(notif)
            db.commit()

    return db_application

# ---------------- DELETE APPLICATION ----------------
@router.delete("/{application_id}", status_code=status.HTTP_200_OK)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    db_application = db.query(Application).filter(
        Application.application_id == application_id).first()

    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(db_application)
    db.commit()
    return {"detail": "Application deleted successfully"}
