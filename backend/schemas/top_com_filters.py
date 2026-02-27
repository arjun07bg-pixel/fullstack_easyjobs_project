
from pydantic import BaseModel
from pydantic import ConfigDict

class JobOut(BaseModel):
    id: int
    title: str
    location: str
    experience_level: str
    job_function: str
    work_mode: str
    job_type: str

    model_config = ConfigDict(from_attributes=True)




