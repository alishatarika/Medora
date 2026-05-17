from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(150), nullable=False)
    specialty   = Column(String(100))
    location    = Column(String(150))
    experience  = Column(Integer, default=0)
    fees        = Column(Float, default=0.0)
    description = Column(String(1000))
    status      = Column(String(20), default="active")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at  = Column(DateTime(timezone=True), nullable=True)
