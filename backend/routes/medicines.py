from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.medicine import MedicineOut
from controllers.medicine_controller import get_medicines, get_medicine_by_id, get_medicine_by_scan

router = APIRouter(prefix="/medicines", tags=["Medicines"])

@router.get("/", response_model=List[MedicineOut])
def list_medicines(query: str = Query(""), db: Session = Depends(get_db)):
    return get_medicines(db, query)

@router.get("/scan", response_model=MedicineOut)
def scan_medicine(q: str = Query(..., description="QR code text (medicine name or ID)"), db: Session = Depends(get_db)):
    med = get_medicine_by_scan(q, db)
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@router.get("/{medicine_id}", response_model=MedicineOut)
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    return get_medicine_by_id(medicine_id, db)
