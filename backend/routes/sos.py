from fastapi import APIRouter, Depends
from pydantic import BaseModel
from dependencies import get_current_user
from services.email_service import send_email
from models.user import User

EMERGENCY_CONTACTS = ["alisha.tarikaa@gmail.com"]

router = APIRouter(prefix="/sos", tags=["SOS"])

class SOSRequest(BaseModel):
    location: str = "Location not available"

@router.post("/")
def send_sos(data: SOSRequest, current_user: User = Depends(get_current_user)):
    subject = "🚨 SOS ALERT from MEDORA"

    body = (
        f"EMERGENCY SOS ALERT!\n\n"
        f"Sent by: {current_user.name}\n"
        f"Email:   {current_user.email}\n"
        f"Phone:   {current_user.phone or 'N/A'}\n\n"
        f"Location: {data.location}\n\n"
        f"Please respond immediately.\n\nTeam MEDORA"
    )

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#1a1a1a;color:#fff;padding:30px;border-radius:10px;border:2px solid #ff3b3b;">
      <h2 style="color:#ff3b3b;text-align:center;">🚨 EMERGENCY SOS ALERT</h2>
      <hr style="border-color:#ff3b3b;">
      <p><strong>Sent by:</strong> {current_user.name}</p>
      <p><strong>Email:</strong> {current_user.email}</p>
      <p><strong>Phone:</strong> {current_user.phone or 'N/A'}</p>
      <p><strong>Location:</strong>
        <a href="{data.location}" style="color:#14b8a6;">{data.location}</a>
      </p>
      <hr style="border-color:#444;">
      <p style="color:#ff6b6b;font-weight:bold;text-align:center;">Please respond immediately!</p>
      <p style="text-align:center;color:#888;font-size:12px;">Sent via Medora Health App</p>
    </div>
    """

    results = [send_email(email, subject, body, html) for email in EMERGENCY_CONTACTS]

    if any(results):
        return {"status": "success", "message": "✅ SOS alert sent successfully!"}
    return {"status": "error", "message": "⚠️ Failed to send SOS. Check server logs."}
