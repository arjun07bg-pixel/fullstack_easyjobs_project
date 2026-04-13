from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.interview import Interview
from models.application import Application
from models.notification import Notification
from schemas.interview import InterviewCreate, InterviewOut
from typing import List

router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"]
)

@router.post("/", response_model=InterviewOut)
def schedule_interview(interview: InterviewCreate, db: Session = Depends(get_db)):
    # 1. Check if application exists
    app = db.query(Application).filter(Application.application_id == interview.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # 2. Create Interview
    new_interview = Interview(
        application_id=interview.application_id,
        interview_date=interview.interview_date,
        location=interview.location,
        notes=interview.notes
    )
    
    # 3. Update Application Status
    app.status = "interview"
    
    db.add(new_interview)
    
    # 4. Create Notification for Seeker
    notif = Notification(
        user_id=app.user_id,
        title="📅 Interview Scheduled!",
        message=f"Your interview for {app.job_title} at {app.company_name} has been scheduled for {interview.interview_date.strftime('%d %b, %I:%M %p')}.",
        type="success"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(new_interview)
    return new_interview

@router.get("/", response_model=List[InterviewOut])
def get_interviews(db: Session = Depends(get_db)):
    return db.query(Interview).all()

@router.get("/user/{user_id}", response_model=List[InterviewOut])
def get_user_interviews(user_id: int, db: Session = Depends(get_db)):
    # Get all interviews for applications belonging to this user
    return db.query(Interview).join(Application).filter(Application.user_id == user_id).all()

@router.delete("/{interview_id}")
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    it = db.query(Interview).filter(Interview.id == interview_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(it)
    db.commit()
    return {"message": "Interview cancelled"}
