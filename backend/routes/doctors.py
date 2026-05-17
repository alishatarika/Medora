from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from dependencies import get_current_user
from schemas.doctor import DoctorOut
from schemas.appointment import AppointmentCreate, AppointmentOut
from controllers.doctor_controller import get_doctors, get_doctor_by_id, book_appointment
from models.appointment import Appointment
from models.doctor import Doctor

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/", response_model=List[DoctorOut])
def list_doctors(query: str = Query(""), db: Session = Depends(get_db)):
    return get_doctors(db, query)

@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    return get_doctor_by_id(doctor_id, db)

@router.post("/{doctor_id}/book", response_model=AppointmentOut)
def book(doctor_id: int, data: AppointmentCreate, db: Session = Depends(get_db),
         _=Depends(get_current_user)):
    return book_appointment(doctor_id, data, db)

@router.get("/appointments/my")
def my_appointments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Return all appointments booked by the logged-in user (matched by email)."""
    appts = db.query(Appointment)\
              .filter(Appointment.user_email == current_user.email)\
              .order_by(Appointment.id.desc()).all()
    result = []
    for a in appts:
        doc = db.query(Doctor).filter(Doctor.id == a.doctor_id).first()
        result.append({
            "id": a.id,
            "doctor": doc.name if doc else "Unknown",
            "specialty": doc.specialty if doc else "",
            "date": a.date,
            "time_slot": a.time_slot,
            "status": a.status,
            "created_at": str(a.created_at),
        })
    return result
