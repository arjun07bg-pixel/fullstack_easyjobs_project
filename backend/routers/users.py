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


# ---------------- SIGNUP ----------------
@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    # Email exists check
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Password match check
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed_password = get_password_hash(user.password)

    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
        phone_number=user.phone_number,
        role=user.role,
        image=user.image or "",
        bio=user.bio or "",
        designation=user.designation or "",
        company_name=user.company_name,
        company_size=user.company_size,
        industry=user.industry,
        company_website=user.company_website
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # ── Welcome Notification ──────────────────────────────────
    try:
        from models.notification import Notification
        welcome_notif = Notification(
            user_id=new_user.user_id,
            title="Welcome to EasyJobs! 👋",
            message=f"Hi {new_user.first_name}, thanks for joining us! Start exploring and applying for your dream jobs today.\nEasyJobs-க்கு உங்களை வரவேற்கிறோம்! உங்கள் கனவு வேலைகளைத் தேடி விண்ணப்பிக்கத் தொடங்குங்கள்.",
            type="info"
        )
        db.add(welcome_notif)
        db.commit()
    except Exception as e:
        print(f"⚠️ Welcome notification failed: {e}")

    return new_user


# ---------------- SIGNIN ----------------
@router.post("/signin", response_model=UserOut)
def signin_user(credentials: UserSignin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return user


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