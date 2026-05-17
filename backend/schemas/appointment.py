from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    user_name: str
    user_email: str
    user_phone: str
    date: str
    time_slot: str

class AppointmentOut(BaseModel):
    id: int
    doctor_id: int
    user_name: str
    date: str
    time_slot: str
    status: str

    class Config:
        from_attributes = True
