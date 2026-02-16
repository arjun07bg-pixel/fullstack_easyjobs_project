from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from models.admin import Admin
from schemas.admin import AdminCreate, AdminOut

router = APIRouter(prefix="/admins", tags=["Admins"])

    

# CREATE ADMIN
@router.post("/", response_model=AdminOut)
def create_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    existing_admin = db.query(Admin).filter(Admin.email == admin.email).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")

    new_admin = Admin(**admin.dict())
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin



# GET ALL ADMINS
@router.get("/", response_model=list[AdminOut])
def get_admins(db: Session = Depends(get_db)):
    return db.query(Admin).all()



# GET SINGLE ADMIN
@router.get("/{admin_id}", response_model=AdminOut)
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin



# UPDATE ADMIN
@router.put("/{admin_id}", response_model=AdminOut)
def update_admin(admin_id: int, admin: AdminCreate, db: Session = Depends(get_db)):
    db_admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    db_admin.name = admin.name
    db_admin.email = admin.email
    db_admin.password = admin.password
    db_admin.phone_number = admin.phone_number
    db_admin.subject = admin.subject
    db_admin.message = admin.message

    db.commit()
    db.refresh(db_admin)
    return db_admin



# DELETE ADMIN
@router.delete("/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    db_admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    db.delete(db_admin)
    db.commit()
    return {"detail": "Admin deleted successfully"}
