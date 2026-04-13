from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(prefix="/contact", tags=["Contact"])

class ContactSchema(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    subject: str
    message: str

@router.post("/", status_code=status.HTTP_200_OK)
def submit_contact_form(contact: ContactSchema):
    # In a real app, this would send an email or save to DB
    print(f"Contact Form Submitted: {contact}")
    return {"message": "Message sent successfully"}
