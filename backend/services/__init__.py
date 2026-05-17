"""
Services package — external integrations and utilities.
"""
from .auth_service  import hash_password, verify_password, create_access_token, decode_token
from .otp_service   import generate_otp, store_otp, verify_otp, can_resend
from .email_service import (
    send_email,
    send_otp_email,
    send_order_confirmation,
    send_appointment_confirmation,
)
from .ai_service    import get_ai_response, clear_conversation

__all__ = [
    # auth
    "hash_password", "verify_password", "create_access_token", "decode_token",
    # otp
    "generate_otp", "store_otp", "verify_otp", "can_resend",
    # email
    "send_email", "send_otp_email", "send_order_confirmation", "send_appointment_confirmation",
    # ai
    "get_ai_response", "clear_conversation",
]
