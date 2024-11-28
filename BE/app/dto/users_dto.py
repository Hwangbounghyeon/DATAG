from pydantic import BaseModel, EmailStr
from datetime import datetime

class Department(BaseModel):
    department_id: int
    department_name: str
    class Config:
        from_attributes = True

class UserSignUp(BaseModel):
    name: str
    email: EmailStr
    password: str
    duty: str
    location: str
    department_id: int | None = None
    is_supervised: bool
    class Config:
        from_attributes = True
        
class UserSignIn(BaseModel):
    email: str
    password: str
    
    class Config:
        from_attributes = True
        
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'
    
    class Confing:
        from_attributes = True
        
class UserProfileResponse(BaseModel):
    user_id: int
    name: str
    email: str
    duty: str
    location: str
    department_id: int | None = None
    department_name: str | None = None
    is_supervised: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
class UserProfileUpdateRequest(BaseModel):
    name: str | None = None
    duty: str | None = None
    department_id: int | None = None
    location: str | None = None
    current_password: str | None = None
    new_password: str | None = None
    
    class Config:
        from_attributes = True
