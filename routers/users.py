
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db
from models.user import User
from schemas.user import UserCreate, UserOut, UserSignin, UserUpdate





router = APIRouter(prefix="/users", tags=["Users"])

from core.security import get_password_hash

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    # 1. Email exists check
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Password match check
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # 3. Create user with HASHED password
    hashed_password = get_password_hash(user.password)
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
        phone_number=user.phone_number,
        role=user.role,
        image=user.image or ""
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


from core.security import verify_password

@router.post("/signin", response_model=UserOut)
def signin_user(credentials: UserSignin, db: Session = Depends(get_db)):
    try:
        clean_email = credentials.email.strip().lower()
        user = db.query(User).filter(User.email.ilike(clean_email)).first()
        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return user
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Signin Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected Server Error: {str(e)}")

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

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





