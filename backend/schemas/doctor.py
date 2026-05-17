from pydantic import BaseModel
from typing import Optional

class DoctorOut(BaseModel):
    id: int
    name: str
    specialty: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = None
    fees: Optional[float] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
