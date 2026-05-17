from sqlalchemy import Column, Integer, String
from database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    filename = Column(String(300), nullable=False)   # e.g. "choking.mp4"
    category = Column(String(50), default="firstaid")  # firstaid | home
