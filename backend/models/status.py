from sqlalchemy import Column, Integer, String, Enum
from database.database import Base
import enum


class CandidateStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    REJECTED = "REJECTED"


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    job_role = Column(String, nullable=False)
    status = Column(
        Enum(CandidateStatus),
        default=CandidateStatus.APPLIED
    )
