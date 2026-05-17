"""
Routes package — all FastAPI routers.
Import each router module here so main.py can do:
    from routes import auth, medicines, doctors, orders, chatbot, sos, admin
"""
from . import auth
from . import medicines
from . import doctors
from . import orders
from . import chatbot
from . import sos
from . import admin

__all__ = ["auth", "medicines", "doctors", "orders", "chatbot", "sos", "admin"]
