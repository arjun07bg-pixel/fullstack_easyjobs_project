from pydantic import BaseModel

class ApplicationCreate(BaseModel):
    user_id: int
    job_id: int
    company_name: str
    name: str
    email: str
    phone_number: str
    portfolio_link: str
    resume: str 
    Current_Location: str
    Total_Experience: int
    Current_salary: int
    Notice_Period: int
    Cover_Letter: str

class ApplicationOut(BaseModel):
    application_id: int
    user_id: int
    job_id: int
    company_name: str
    name: str
    email: str
    phone_number: str
    portfolio_link: str
    resume: str
    Current_Location: str
    Total_Experience: int
    Current_salary: int
    Notice_Period: int
    Cover_Letter: str


    class Config:
        from_attributes = True
