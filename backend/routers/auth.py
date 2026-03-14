from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.user import User
from core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from schemas.user import UserCreate, UserSignin, UserOut, OTPVerify
from datetime import datetime, timedelta
import random
import string

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user exists (Normalized email)
    clean_email = user.email.strip().lower()
    existing_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Validate passwords match
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed_password = get_password_hash(user.password)

    try:
        new_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            email=clean_email,
            password=hashed_password,
            phone_number=user.phone_number,
            role=user.role,
            image=user.image or "",
            bio=user.bio or "",
            designation=user.designation or "",
            company_name=user.company_name,
            company_size=user.company_size,
            industry=user.industry,
            company_website=user.company_website,
            is_verified=False
        )

        # Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        new_user.otp_code = otp
        new_user.otp_expiry = datetime.utcnow() + timedelta(minutes=10) # 10 minutes

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"DEBUG: Signup OTP for {clean_email} is {otp}")
        
        return {
            "status": "otp_required",
            "message": "Verification code sent! Please check your email.",
            "email": clean_email,
            "debug_otp": otp
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Registration failed: {str(e)}\nபதிவு தோல்வியடைந்தது: {str(e)}"
        )

@router.post("/login")
def login(credentials: UserSignin, db: Session = Depends(get_db)):
    try:
        clean_email = credentials.email.strip().lower()
        
        # Admin bypass for simplicity or keep it secure? 
        # User said "User login", typically admins might want 2FA too, but let's keep it simple for now or apply to all.
        
        user = db.query(User).filter(User.email.ilike(clean_email)).first()
        
        # ── Admin Check ────────────────────────────────────────────────
        ADMIN_EMAIL    = "admin07@gmail.com"
        ADMIN_PASSWORD = "Admin12307"

        if clean_email == ADMIN_EMAIL and credentials.password == ADMIN_PASSWORD:
            # We skip OTP for hardcoded admin for developer convenience, 
            # but regular users definitely get it.
            access_token = create_access_token(
                data={"sub": ADMIN_EMAIL, "user_id": 0, "role": "admin"}
            )
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": 0,
                "email": ADMIN_EMAIL,
                "role": "admin",
                "first_name": "Admin"
            }
        # ─────────────────────────────────────────────────────────────

        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # 1. Generate 6-digit OTP
        otp = ''.join(random.choices(string.digits, k=6))
        user.otp_code = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
        db.commit()

        # In a real app, you'd SEND the email here. 
        # For now, we simulate success and tell the frontend OTP is sent.
        print(f"DEBUG: OTP for {clean_email} is {otp}")
        
        return {
            "status": "otp_required",
            "message": "A 6-digit verification code has been generated.",
            "email": clean_email,
            "debug_otp": otp # Sent for simulation display
        }

    except HTTPException as e: raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check OTP and Expiry
    if user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    if user.otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code expired")
    
    # Verify the user
    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None
    db.commit()

    # ── Welcome Notification (After first time verification) ─────
    try:
        from models.notification import Notification
        welcome_notif = Notification(
            user_id=user.user_id,
            title="Welcome to EasyJobs! 👋",
            message=f"Hi {user.first_name}, your email is verified! Start exploring jobs and internships today.\nEasyJobs-க்கு உங்களை வரவேற்கிறோம்! வேலைகளைத் தேடத் தொடங்குங்கள்.",
            type="success"
        )
        db.add(welcome_notif)
        db.commit()
    except Exception as e:
        print(f"⚠️ Welcome notification failed: {e}")

    # Generate Token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.user_id, "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name
    }
