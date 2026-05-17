from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from dependencies import get_admin_user
from models.doctor import Doctor
from models.medicine import Medicine
from models.order import Order, OrderItem
from models.appointment import Appointment
from models.user import User
from schemas.doctor import DoctorOut
from schemas.medicine import MedicineOut
from schemas.user import UserOut
from schemas.admin import DoctorCreate, DoctorUpdate, MedicineCreate, MedicineUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Doctors ───────────────────────────────────────────────────────────────────

@router.get("/doctors", response_model=List[DoctorOut])
def admin_list_doctors(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(Doctor).all()

@router.post("/doctors", response_model=DoctorOut)
def admin_create_doctor(data: DoctorCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    doc = Doctor(**data.model_dump())
    db.add(doc); db.commit(); db.refresh(doc)
    return doc

@router.put("/doctors/{doc_id}", response_model=DoctorOut)
def admin_update_doctor(doc_id: int, data: DoctorUpdate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    doc = db.query(Doctor).filter(Doctor.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(doc, k, v)
    db.commit(); db.refresh(doc)
    return doc

@router.delete("/doctors/{doc_id}")
def admin_delete_doctor(doc_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    doc = db.query(Doctor).filter(Doctor.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doc); db.commit()
    return {"message": "Doctor deleted"}


# ── Medicines ─────────────────────────────────────────────────────────────────

@router.get("/medicines", response_model=List[MedicineOut])
def admin_list_medicines(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(Medicine).all()

@router.post("/medicines", response_model=MedicineOut)
def admin_create_medicine(data: MedicineCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    med = Medicine(**data.model_dump())
    db.add(med); db.commit(); db.refresh(med)
    return med

@router.put("/medicines/{med_id}", response_model=MedicineOut)
def admin_update_medicine(med_id: int, data: MedicineUpdate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    med = db.query(Medicine).filter(Medicine.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(med, k, v)
    db.commit(); db.refresh(med)
    return med

@router.delete("/medicines/{med_id}")
def admin_delete_medicine(med_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    med = db.query(Medicine).filter(Medicine.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(med); db.commit()
    return {"message": "Medicine deleted"}


# ── Orders ────────────────────────────────────────────────────────────────────

@router.get("/orders")
def admin_list_orders(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    orders = db.query(Order).order_by(Order.id.desc()).all()
    result = []
    for o in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == o.id).all()
        result.append({
            "id": o.id,
            "customer_name": o.customer_name,
            "email": o.email,
            "phone": o.phone,
            "address": o.address,
            "total": o.total,
            "order_date": str(o.order_date),
            "items": [{"name": i.medicine_name, "qty": i.quantity, "subtotal": i.subtotal} for i in items]
        })
    return result

@router.delete("/orders/{order_id}")
def admin_delete_order(order_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()
    db.delete(order); db.commit()
    return {"message": "Order deleted"}


# ── Appointments ──────────────────────────────────────────────────────────────

@router.get("/appointments")
def admin_list_appointments(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    appts = db.query(Appointment).order_by(Appointment.id.desc()).all()
    result = []
    for a in appts:
        doc = db.query(Doctor).filter(Doctor.id == a.doctor_id).first()
        result.append({
            "id": a.id,
            "doctor": doc.name if doc else "Unknown",
            "patient": a.user_name,
            "email": a.user_email,
            "phone": a.user_phone,
            "date": a.date,
            "time_slot": a.time_slot,
            "status": a.status
        })
    return result

@router.put("/appointments/{appt_id}/status")
def admin_update_appointment_status(
    appt_id: int, status: str,
    db: Session = Depends(get_db), _=Depends(get_admin_user)
):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}

@router.delete("/appointments/{appt_id}")
def admin_delete_appointment(appt_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appt); db.commit()
    return {"message": "Appointment deleted"}


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def admin_list_users(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(User).all()

@router.put("/users/{user_id}/toggle-admin", response_model=UserOut)
def admin_toggle_admin(user_id: int, db: Session = Depends(get_db), current=Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="Cannot change your own admin status")
    user.is_admin = not user.is_admin
    db.commit(); db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def admin_delete_user(user_id: int, db: Session = Depends(get_db), current=Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user); db.commit()
    return {"message": "User deleted"}
