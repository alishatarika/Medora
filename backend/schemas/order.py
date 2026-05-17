from pydantic import BaseModel
from typing import List, Optional

class CartItem(BaseModel):
    medicine_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    address: str
    phone: str
    email: Optional[str] = None
    items: List[CartItem]

class OrderOut(BaseModel):
    id: int
    customer_name: str
    total: float

    class Config:
        from_attributes = True
