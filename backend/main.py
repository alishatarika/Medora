from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base, SessionLocal
import models
import os

from routes import auth, medicines, doctors, orders, chatbot, sos, admin

Base.metadata.create_all(bind=engine)



app = FastAPI(title="Medora API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (videos, thumbnails) from backend/static/
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(auth.router)
app.include_router(medicines.router)
app.include_router(doctors.router)
app.include_router(orders.router)
app.include_router(chatbot.router)
app.include_router(sos.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Medora API is running"}
