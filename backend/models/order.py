from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)
    address = Column(String(300))
    phone = Column(String(20))
    email = Column(String(150))
    total = Column(Float, default=0.0)
    order_date = Column(DateTime(timezone=True), server_default=func.now())

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    medicine_id = Column(Integer)
    medicine_name = Column(String(200))
    price = Column(Float)
    quantity = Column(Integer)
    subtotal = Column(Float)
