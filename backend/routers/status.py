from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies import get_db
from models.status import Candidate, CandidateStatus
from schemas.status import CandidateCreate, CandidateStatusOut

router = APIRouter(
    prefix="/user/candidates",
    tags=["User - Candidate Status"]
)


@router.post(
    "/",
    response_model=CandidateStatusOut,
    status_code=status.HTTP_201_CREATED
)
def apply_job(
    data: CandidateCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Candidate).filter(
        Candidate.email == data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate already applied"
        )

    candidate = Candidate(
        name=data.name,
        email=data.email,
        job_role=data.job_role
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return candidate



@router.get(
    "/{candidate_id}/status",
    response_model=CandidateStatusOut,
    status_code=status.HTTP_200_OK
)
def view_application_status(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    return candidate



@router.delete(
    "/{candidate_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_application(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(
        Candidate.id == candidate_id
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if candidate.status != CandidateStatus.APPLIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete after review"
        )

    db.delete(candidate)
    db.commit()
