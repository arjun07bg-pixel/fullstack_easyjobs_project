from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database.database import get_db
from models.user import User
from schemas.user import UserCreate, UserSignin, UserOut
from schemas.token import Token
from core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user exists (Normalized email)
    clean_email = user.email.strip().lower()
    existing_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Validate passwords match
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # 3. Create new user with HASHED password
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=clean_email,
        password=hashed_password, # Storing hash
        phone_number=user.phone_number,
        role=user.role,
        image=user.image or ""
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login(credentials: UserSignin, db: Session = Depends(get_db)):
    try:
        # 1. Fetch user (Clean email: lowercase and stripped of spaces)
        clean_email = credentials.email.strip().lower()
        user = db.query(User).filter(User.email.ilike(clean_email)).first()
        
        # 2. Verify user and password
        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 3. Create Token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.email), "user_id": int(user.user_id), "role": str(user.role)},
            expires_delta=access_token_expires
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
    except HTTPException as http_exc:
        # Re-raise HTTPExceptions (like 401) so they are not caught by the generic Exception block
        raise http_exc
    except Exception as e:
        print(f"Login Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Server Error: {str(e)}")
