from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user import User
from schemas.user import UserCreate, UserLogin, ChangePassword, UpdateProfile
from services.auth_service import hash_password, verify_password, create_access_token
from services.otp_service import generate_otp, store_otp, verify_otp, can_resend
from services.email_service import send_otp_email


# ── Registration ──────────────────────────────────────────────────────────────

def send_register_otp(data: UserCreate, db: Session):
    """
    Step 1: Create user as unverified (or resend OTP if already unverified).
    Blocks if email is already verified.
    """
    existing = db.query(User).filter(User.email == data.email).first()

    if existing and existing.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered")

    if existing and not existing.is_verified:
        # Resend OTP for existing unverified user
        otp = generate_otp()
        store_otp(data.email, otp, payload={"user_id": existing.id})
        send_otp_email(data.email, otp, purpose="account registration")
        return {"message": f"OTP resent to {data.email}"}

    # Check other unique fields
    if db.query(User).filter(User.name == data.name).first():
        raise HTTPException(status_code=400, detail="Name already taken. Please choose a different name")
    if data.phone and db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Create unverified user
    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone or None,
        hashed_password=hash_password(data.password),
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    otp = generate_otp()
    store_otp(data.email, otp, payload={"user_id": user.id})
    send_otp_email(data.email, otp, purpose="account registration")
    return {"message": f"OTP sent to {data.email}"}


def confirm_register_otp(email: str, otp: str, db: Session):
    """Step 2: Verify OTP and mark user as verified."""
    try:
        verify_otp(email, otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    user.is_verified = True
    db.commit()
    return {"message": "Account verified successfully"}


# ── Login ─────────────────────────────────────────────────────────────────────

def login_user(data: UserLogin, db: Session):
    """Login by email OR name. Blocks unverified accounts."""
    from sqlalchemy import or_
    identifier = data.identifier.strip()

    user = db.query(User).filter(
        or_(User.email == identifier, User.name == identifier)
    ).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        # Resend OTP and tell frontend to redirect to OTP page
        otp = generate_otp()
        store_otp(user.email, otp, payload={"user_id": user.id})
        send_otp_email(user.email, otp, purpose="account verification")
        raise HTTPException(
            status_code=403,
            detail={"code": "unverified", "email": user.email,
                    "message": "Account not verified. OTP sent to your email."}
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ── Change Password ───────────────────────────────────────────────────────────

def send_change_password_otp(user: User):
    """Step 1: Send OTP to the logged-in user's email."""
    otp = generate_otp()
    store_otp(user.email, otp, payload={"action": "change_password"})
    send_otp_email(user.email, otp, purpose="password change")
    return {"message": f"OTP sent to {user.email}"}


def confirm_change_password_otp(user_id: int, otp: str, new_password: str, db: Session):
    """Step 2: Verify OTP then update password."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        verify_otp(user.email, otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# ── Update Profile ────────────────────────────────────────────────────────────

def send_update_profile_otp(user: User):
    """Step 1: Send OTP to verify identity before profile update."""
    otp = generate_otp()
    store_otp(user.email, otp, payload={"action": "update_profile"})
    send_otp_email(user.email, otp, purpose="profile update")
    return {"message": f"OTP sent to {user.email}"}


def confirm_update_profile_otp(user_id: int, otp: str, name: str | None, phone: str | None, address: str | None, db: Session):
    """Step 2: Verify OTP then update profile fields."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        verify_otp(user.email, otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if name and name != user.name:
        if db.query(User).filter(User.name == name, User.id != user_id).first():
            raise HTTPException(status_code=400, detail="Name already taken")
        user.name = name

    if phone and phone != user.phone:
        if db.query(User).filter(User.phone == phone, User.id != user_id).first():
            raise HTTPException(status_code=400, detail="Phone number already registered")
        user.phone = phone

    if address is not None:
        user.address = address or None

    db.commit()
    db.refresh(user)
    return user


# ── Forgot Password (no login required) ──────────────────────────────────────

def send_forgot_password_otp(email: str, db: Session):
    """Find user by email and send OTP."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    otp = generate_otp()
    store_otp(email, otp, payload={"action": "forgot_password"})
    send_otp_email(email, otp, purpose="password reset")
    return {"message": f"OTP sent to {email}"}


def confirm_forgot_password_otp(email: str, otp: str, new_password: str, db: Session):
    """Verify OTP then reset password — no auth token needed."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        verify_otp(email, otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password reset successfully"}

def get_user_by_id(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Change Email ──────────────────────────────────────────────────────────────

def send_change_email_otp(user: User, new_email: str, db: Session):
    """Send OTP to the NEW email to verify ownership."""
    new_email = new_email.strip().lower()
    if new_email == user.email.lower():
        raise HTTPException(status_code=400, detail="New email is the same as current email")
    if db.query(User).filter(User.email == new_email).first():
        raise HTTPException(status_code=400, detail="Email already in use by another account")
    otp = generate_otp()
    # Store with new_email as key so verify knows which email to set
    store_otp(new_email, otp, payload={"user_id": user.id, "new_email": new_email})
    send_otp_email(new_email, otp, purpose="email change verification")
    return {"message": f"OTP sent to {new_email}. Check your new inbox."}


def confirm_change_email_otp(user_id: int, new_email: str, otp: str, db: Session):
    """Verify OTP sent to new email, then update the email."""
    new_email = new_email.strip().lower()
    try:
        payload = verify_otp(new_email, otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if payload.get("user_id") != user_id:
        raise HTTPException(status_code=400, detail="OTP mismatch")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Final uniqueness check
    if db.query(User).filter(User.email == new_email, User.id != user_id).first():
        raise HTTPException(status_code=400, detail="Email already in use")

    user.email = new_email
    db.commit()
    db.refresh(user)
    return user


# ── Resend OTPs ───────────────────────────────────────────────────────────────

def resend_register_otp(email: str, db: Session):
    """Resend registration OTP — public, requires unverified account."""
    email = email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account is already verified")

    allowed, wait = can_resend(email)
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Please wait {wait} seconds before requesting a new OTP")

    otp = generate_otp()
    store_otp(email, otp, payload={"user_id": user.id})
    send_otp_email(email, otp, purpose="account registration")
    return {"message": f"OTP resent to {email}"}


def resend_change_password_otp(user: User):
    """Resend change-password OTP — requires login."""
    allowed, wait = can_resend(user.email)
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Please wait {wait} seconds before requesting a new OTP")

    otp = generate_otp()
    store_otp(user.email, otp, payload={"action": "change_password"})
    send_otp_email(user.email, otp, purpose="password change")
    return {"message": f"OTP resent to {user.email}"}


def resend_forgot_password_otp(email: str, db: Session):
    """Resend forgot-password OTP — public."""
    email = email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    allowed, wait = can_resend(email)
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Please wait {wait} seconds before requesting a new OTP")

    otp = generate_otp()
    store_otp(email, otp, payload={"action": "forgot_password"})
    send_otp_email(email, otp, purpose="password reset")
    return {"message": f"OTP resent to {email}"}
