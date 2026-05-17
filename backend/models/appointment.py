from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id          = Column(Integer, primary_key=True, index=True)
    doctor_id   = Column(Integer, nullable=False)
    user_name   = Column(String(150), nullable=False)
    user_email  = Column(String(150), nullable=False)
    user_phone  = Column(String(20), nullable=False)
    date        = Column(String(20), nullable=False)
    time_slot   = Column(String(20), nullable=False)
    status      = Column(String(50), default="Booked")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at  = Column(DateTime(timezone=True), nullable=True)
