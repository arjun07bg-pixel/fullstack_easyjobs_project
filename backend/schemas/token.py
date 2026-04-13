from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
