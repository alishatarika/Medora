from pydantic import BaseModel
from typing import Optional

class DoctorCreate(BaseModel):
    name: str
    specialty: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = 0
    fees: Optional[float] = 0.0
    description: Optional[str] = None

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = None
    fees: Optional[float] = None
    description: Optional[str] = None

class MedicineCreate(BaseModel):
    name: str
    category: Optional[str] = None
    company: Optional[str] = None
    price: Optional[float] = 0.0
    description: Optional[str] = None

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    company: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
