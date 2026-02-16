from pydantic import BaseModel

class AdminCreate(BaseModel):
    admin_name: str
    email: str
    password: str

    phone_number: str
    subject: str
    message: str


class AdminOut(BaseModel):
    admin_id: int
    admin_name: str
    email: str

    phone_number: str
    subject: str
    message: str

    class Config:
        from_attributes = True
