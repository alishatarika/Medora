"""
Schemas package — all Pydantic request/response models.
"""
from .user import (
    UserCreate,
    UserLogin,
    UserOut,
    ChangePassword,
    UpdateProfile,
    RequestOTP,
    VerifyRegisterOTP,
    VerifyProfileOTP,
    VerifyPasswordOTP,
    ForgotPasswordRequest,
    ForgotPasswordReset,
)
from .medicine    import MedicineOut
from .doctor      import DoctorOut
from .order       import CartItem, OrderCreate, OrderOut
from .appointment import AppointmentCreate, AppointmentOut
from .admin       import DoctorCreate, DoctorUpdate, MedicineCreate, MedicineUpdate

__all__ = [
    # user
    "UserCreate", "UserLogin", "UserOut",
    "ChangePassword", "UpdateProfile",
    "RequestOTP", "VerifyRegisterOTP", "VerifyProfileOTP", "VerifyPasswordOTP",
    "ForgotPasswordRequest", "ForgotPasswordReset",
    # medicine
    "MedicineOut",
    # doctor
    "DoctorOut",
    # order
    "CartItem", "OrderCreate", "OrderOut",
    # appointment
    "AppointmentCreate", "AppointmentOut",
    # admin
    "DoctorCreate", "DoctorUpdate", "MedicineCreate", "MedicineUpdate",
]
