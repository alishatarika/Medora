from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
from schemas.order import OrderCreate, OrderOut
from controllers.order_controller import place_order
from models.order import Order, OrderItem

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db),
                 _=Depends(get_current_user)):
    return place_order(data, db)

@router.get("/my")
def my_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Return all orders placed by the logged-in user (matched by email)."""
    orders = db.query(Order).filter(Order.email == current_user.email)\
               .order_by(Order.id.desc()).all()
    result = []
    for o in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == o.id).all()
        result.append({
            "id": o.id,
            "customer_name": o.customer_name,
            "address": o.address,
            "phone": o.phone,
            "total": o.total,
            "order_date": str(o.order_date),
            "items": [
                {"name": i.medicine_name, "qty": i.quantity,
                 "price": i.price, "subtotal": i.subtotal}
                for i in items
            ]
        })
    return result
