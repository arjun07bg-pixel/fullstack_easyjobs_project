from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.dependencies import get_db
from backend.models.application import Application
from backend.schemas.application import ApplicationCreate, ApplicationOut

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)

@router.get("/download/{filename}")
def download_resume(filename: str):
    # This is a placeholder. Real implementation would use FileResponse
    return {"message": f"Resume file '{filename}' exists in the database. Actual file download requires a cloud storage setup (like AWS S3)."}




@router.post("/", response_model=ApplicationOut)
def apply_job(app: ApplicationCreate, db: Session = Depends(get_db)):
    # 1. Ensure user exists (Prevents IntegrityError if DB was reset/wiped)
    from backend.models.user import User
    existing_user = db.query(User).filter(User.user_id == app.user_id).first()
    if not existing_user:
        # If user is in frontend but not in DB, it's a critical sync issue
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Your session is no longer valid in our database. Please login again to re-sync your account."
        )

    # 2. Check if the Job ID exists in the real database (Soft Foreign Key)
    safe_job_id = None
    if app.job_id and app.job_id > 0:
        from backend.models.job import Job
        job_exists = db.query(Job).filter(Job.job_id == app.job_id).first()
        if job_exists:
            safe_job_id = app.job_id
        else:
            # This is a static/mock job from a company page
            print(f"ℹ️ Linking application to static job: {app.job_title} at {app.company_name}")

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
            Total_Experience=app.Total_Experience,
            Current_salary=app.Current_salary,
            Notice_Period=app.Notice_Period,
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
            detail=f"Database error: {str(e)}. Please try again later."
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
    user_apps = db.query(Application).filter(Application.user_id == user_id).all()
    # Even if empty list, return it
    return user_apps



# ---------------- GET SINGLE APPLICATION ----------------
@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.application_id == application_id).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

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
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db_application.user_id = app.user_id
    db_application.job_id = app.job_id
    db_application.company_name = app.company_name
    db_application.job_title = app.job_title
    db_application.status = app.status
    db_application.name = app.name
    db_application.email = app.email
    db_application.phone_number = app.phone_number
    db_application.portfolio_link = app.portfolio_link
    db_application.resume = app.resume
    db_application.Current_Location = app.Current_Location
    db_application.Total_Experience = app.Total_Experience
    db_application.Current_salary = app.Current_salary
    db_application.Notice_Period = app.Notice_Period
    db_application.Cover_Letter = app.Cover_Letter
    db_application.job_type = app.job_type

    db.commit()
    db.refresh(db_application)
    return db_application




# ---------------- PARTIAL UPDATE APPLICATION (Status, etc) ----------------
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
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(db_application)
    db.commit()
    return {"detail": "Application deleted successfully"}
