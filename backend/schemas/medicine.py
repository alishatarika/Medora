from pydantic import BaseModel
from typing import Optional

class MedicineOut(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    company: Optional[str] = None
    price: float
    description: Optional[str] = None

    class Config:
        from_attributes = True
