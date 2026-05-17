from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(200), nullable=False)
    category    = Column(String(100))
    company     = Column(String(150))
    price       = Column(Float, default=0.0)
    description = Column(String(1000))
    status      = Column(String(20), default="active")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at  = Column(DateTime(timezone=True), nullable=True)
