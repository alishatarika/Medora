from sqlalchemy.orm import Session
from models.medicine import Medicine

def get_medicines(db: Session, query: str = "", limit: int = 50):
    q = db.query(Medicine)
    if query:
        like = f"%{query}%"
        q = q.filter(
            Medicine.name.ilike(like) |
            Medicine.category.ilike(like) |
            Medicine.company.ilike(like)
        )
    return q.limit(limit).all()

def get_medicine_by_id(medicine_id: int, db: Session):
    return db.query(Medicine).filter(Medicine.id == medicine_id).first()

def get_medicine_by_scan(text: str, db: Session):
    """Lookup medicine by QR code text — tries numeric ID, exact name, partial name, then first-word match."""
    text = text.strip()

    # Try numeric ID
    if text.isdigit():
        med = db.query(Medicine).filter(Medicine.id == int(text)).first()
        if med:
            return med

    # Try exact name (case-insensitive)
    med = db.query(Medicine).filter(Medicine.name.ilike(text)).first()
    if med:
        return med

    # Try partial match (text contains medicine name or vice versa)
    med = db.query(Medicine).filter(Medicine.name.ilike(f"%{text}%")).first()
    if med:
        return med

    # Try matching just the first word(s) — handles "Paracetamol 500 mg" → "Paracetamol"
    words = text.split()
    for n in range(len(words) - 1, 0, -1):
        partial = " ".join(words[:n])
        med = db.query(Medicine).filter(Medicine.name.ilike(f"%{partial}%")).first()
        if med:
            return med

    return None
