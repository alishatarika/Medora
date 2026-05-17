from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import (
    UserCreate, UserLogin, UserOut,
    RequestOTP, VerifyRegisterOTP, VerifyProfileOTP, VerifyPasswordOTP,
    ForgotPasswordRequest, ForgotPasswordReset,
    ChangeEmailRequest, VerifyChangeEmailOTP
)
from controllers.auth_controller import (
    send_register_otp, confirm_register_otp,
    login_user,
    send_change_password_otp, confirm_change_password_otp,
    send_update_profile_otp, confirm_update_profile_otp,
    send_forgot_password_otp, confirm_forgot_password_otp,
    resend_register_otp, resend_change_password_otp, resend_forgot_password_otp,
    send_change_email_otp, confirm_change_email_otp,
    get_user_by_id
)
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Registration (2-step OTP) ─────────────────────────────────────────────────

@router.post("/register/send-otp")
def register_send_otp(data: UserCreate, db: Session = Depends(get_db)):
    """Step 1 — validate details and email OTP."""
    return send_register_otp(data, db)

@router.post("/register/verify-otp")
def register_verify_otp(data: VerifyRegisterOTP, db: Session = Depends(get_db)):
    """Step 2 — verify OTP and mark account as verified."""
    return confirm_register_otp(data.email, data.otp, db)

@router.post("/register/resend-otp")
def register_resend_otp(data: RequestOTP, db: Session = Depends(get_db)):
    """Resend registration OTP (public, 30s cooldown)."""
    return resend_register_otp(data.email, db)


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    result = login_user(data, db)
    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"],
        "user": UserOut.model_validate(result["user"])
    }


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user


# ── Change Password (2-step OTP) ──────────────────────────────────────────────

@router.post("/change-password/send-otp")
def change_password_send_otp(current_user=Depends(get_current_user)):
    """Step 1 — send OTP to logged-in user's email."""
    return send_change_password_otp(current_user)

@router.post("/change-password/verify-otp")
def change_password_verify_otp(
    data: VerifyPasswordOTP,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Step 2 — verify OTP and set new password."""
    return confirm_change_password_otp(current_user.id, data.otp, data.new_password, db)

@router.post("/change-password/resend-otp")
def change_password_resend_otp(current_user=Depends(get_current_user)):
    """Resend change-password OTP (requires login, 30s cooldown)."""
    return resend_change_password_otp(current_user)


# ── Update Profile (2-step OTP) ───────────────────────────────────────────────

@router.post("/profile/send-otp")
def profile_send_otp(current_user=Depends(get_current_user)):
    return send_update_profile_otp(current_user)

@router.post("/profile/resend-otp")
def profile_resend_otp(current_user=Depends(get_current_user)):
    return resend_change_password_otp(current_user)  # same logic — resend to logged-in user

@router.put("/profile/verify-otp", response_model=UserOut)
def profile_verify_otp(
    data: VerifyProfileOTP,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Step 2 — verify OTP and apply profile changes."""
    return confirm_update_profile_otp(current_user.id, data.otp, data.name, data.phone, data.address, db)


# ── Forgot Password (public, no token needed) ─────────────────────────────────

@router.post("/forgot-password/send-otp")
def forgot_password_send_otp(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Step 1 — send OTP to the email."""
    return send_forgot_password_otp(data.email, db)

@router.post("/forgot-password/reset")
def forgot_password_reset(data: ForgotPasswordReset, db: Session = Depends(get_db)):
    """Step 2 — verify OTP and set new password."""
    return confirm_forgot_password_otp(data.email, data.otp, data.new_password, db)

@router.post("/forgot-password/resend-otp")
def forgot_password_resend_otp(data: RequestOTP, db: Session = Depends(get_db)):
    """Resend forgot-password OTP (public, 30s cooldown)."""
    return resend_forgot_password_otp(data.email, db)


# ── Change Email (2-step OTP to new email) ────────────────────────────────────

@router.post("/change-email/send-otp")
def change_email_send_otp(
    data: ChangeEmailRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Step 1 — send OTP to the new email address."""
    return send_change_email_otp(current_user, data.new_email, db)

@router.post("/change-email/verify-otp", response_model=UserOut)
def change_email_verify_otp(
    data: VerifyChangeEmailOTP,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Step 2 — verify OTP and update email."""
    return confirm_change_email_otp(current_user.id, data.new_email, data.otp, db)
