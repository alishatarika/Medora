import random
import string
from datetime import datetime, timedelta
from typing import Dict

_otp_store: Dict[str, dict] = {}

OTP_EXPIRY_MINUTES = 10
RESEND_COOLDOWN_SECONDS = 30   # must wait 30s before resending


def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))


def store_otp(email: str, otp: str, payload: dict = {}):
    email = email.strip().lower()
    _otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
        "sent_at": datetime.utcnow(),
        "payload": payload,
    }


def can_resend(email: str) -> tuple[bool, int]:
    """
    Returns (can_resend, seconds_remaining).
    If no OTP exists, resend is allowed.
    """
    email = email.strip().lower()
    record = _otp_store.get(email)
    if not record:
        return True, 0
    elapsed = (datetime.utcnow() - record["sent_at"]).total_seconds()
    if elapsed < RESEND_COOLDOWN_SECONDS:
        remaining = int(RESEND_COOLDOWN_SECONDS - elapsed)
        return False, remaining
    return True, 0


def verify_otp(email: str, otp: str) -> dict:
    email = email.strip().lower()
    otp = otp.strip()

    record = _otp_store.get(email)
    if not record:
        raise ValueError("No OTP requested for this email. Please request a new one")
    if datetime.utcnow() > record["expires_at"]:
        _otp_store.pop(email, None)
        raise ValueError("OTP has expired. Please request a new one")
    if record["otp"] != otp:
        raise ValueError("Invalid OTP. Please check and try again")

    payload = record.get("payload", {})
    _otp_store.pop(email, None)   # single-use
    return payload
