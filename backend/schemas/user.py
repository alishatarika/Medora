from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    identifier: str   # accepts email OR name
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    is_admin: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class UpdateProfile(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

# OTP flows
class RequestOTP(BaseModel):
    email: EmailStr

class VerifyRegisterOTP(BaseModel):
    email: EmailStr
    otp: str

class VerifyProfileOTP(BaseModel):
    otp: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ChangeEmailRequest(BaseModel):
    new_email: EmailStr

class VerifyChangeEmailOTP(BaseModel):
    new_email: EmailStr
    otp: str

class VerifyPasswordOTP(BaseModel):
    otp: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordReset(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
