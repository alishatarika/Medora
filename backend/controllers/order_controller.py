from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.order import Order, OrderItem
from models.medicine import Medicine
from schemas.order import OrderCreate
from services.email_service import send_order_confirmation

def place_order(data: OrderCreate, db: Session):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    order = Order(
        customer_name=data.customer_name,
        address=data.address,
        phone=data.phone,
        email=data.email or "",
        total=0
    )
    db.add(order)
    db.flush()

    email_items = []
    for item in data.items:
        med = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        if not med:
            continue
        subtotal = med.price * item.quantity
        total += subtotal
        db.add(OrderItem(
            order_id=order.id,
            medicine_id=med.id,
            medicine_name=med.name,
            price=med.price,
            quantity=item.quantity,
            subtotal=subtotal
        ))
        email_items.append({"name": med.name, "qty": item.quantity, "subtotal": subtotal})

    order.total = total
    db.commit()
    db.refresh(order)

    # Send confirmation email
    if data.email:
        send_order_confirmation(data.email, data.customer_name, order.id, total, email_items)

    return order
