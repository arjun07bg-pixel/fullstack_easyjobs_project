from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies import get_db
from models.company import Company
from schemas.company import CompanyCreate, CompanyOut
from fastapi import HTTPException, status

router = APIRouter(prefix="/companies", tags=["Companies"])


# -------------------------
# Create a new company
# -------------------------
@router.post("/", response_model=CompanyOut)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    new_company = Company(**company.dict())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

 
# -------------------------
# Get all companies
# -------------------------
@router.get("/", response_model=list[CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()



# -------------------------
# Get single company by ID
# -------------------------
@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company



# -------------------------
# Update a company
# -------------------------
@router.put("/{company_id}", response_model=CompanyOut)
def update_company(company_id: int, company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.company_id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update fields
    db_company.company_name = company.company_name
    db_company.location= company.location
    db_company.details = company.details
    
    db.commit()
    db.refresh(db_company)
    return db_company




# -------------------------
# Delete a company
# -------------------------
@router.delete("/{company_id}", status_code=status.HTTP_200_OK)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.company_id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted successfully"}

