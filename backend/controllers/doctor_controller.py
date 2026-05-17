from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.doctor import Doctor
from models.appointment import Appointment
from schemas.appointment import AppointmentCreate
from services.email_service import send_appointment_confirmation
from datetime import date, datetime

def get_doctors(db: Session, query: str = "", limit: int = 50):
    q = db.query(Doctor)
    if query:
        like = f"%{query}%"
        q = q.filter(
            Doctor.name.ilike(like) |
            Doctor.specialty.ilike(like) |
            Doctor.location.ilike(like)
        )
    return q.limit(limit).all()

def get_doctor_by_id(doctor_id: int, db: Session):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

def book_appointment(doctor_id: int, data: AppointmentCreate, db: Session):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Validate date not in past
    selected_date = datetime.strptime(data.date, "%Y-%m-%d").date()
    if selected_date < date.today():
        raise HTTPException(status_code=400, detail="Date cannot be in the past")

    appointment = Appointment(
        doctor_id=doctor_id,
        user_name=data.user_name,
        user_email=data.user_email,
        user_phone=data.user_phone,
        date=data.date,
        time_slot=data.time_slot,
        status="Booked"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    send_appointment_confirmation(data.user_email, data.user_name, doctor.name, data.date, data.time_slot)
    return appointment
