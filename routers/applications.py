from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies import get_db
from models.application import Application
from schemas.application import ApplicationCreate, ApplicationOut

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)




@router.post("/", response_model=ApplicationOut)
def apply_job(app: ApplicationCreate, db: Session = Depends(get_db)):

    new_application = Application(
        user_id=app.user_id,
        job_id=app.job_id,
        company_name=app.company_name,
        resume=app.resume,
        name=app.name,
        email=app.email,
        portfolio_link = app.portfolio_link,
        phone_number=app.phone_number,
        Current_Location = app.Current_Location,
        Total_Experience = app.Total_Experience,
        Current_salary = app.Current_salary,
        Notice_Period = app.Notice_Period,
        Cover_Letter = app.Cover_Letter
        )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application




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
