from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies import get_db
from models.user import User
from schemas.user import UserCreate, UserOut, UserSignin, UserUpdate
from core.security import get_password_hash, verify_password

router = APIRouter(prefix="/users", tags=["Users"])


# ---------------- GET ALL USERS ----------------
@router.get("/", response_model=list[UserOut])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# Registration and Signin are handled in auth.py with OTP verification.
# This router is strictly for user profile management.


# ---------------- GET USER ----------------
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------------- UPDATE USER ----------------
@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.user_id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return db_user