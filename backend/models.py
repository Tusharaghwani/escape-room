from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    parent_room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    question = Column(String, index=True)
    answer = Column(String)
    creator = Column(String)
    is_active = Column(Boolean, default=True)
    
    # ML Features
    sentiment = Column(String, default="neutral") # "dark", "light", "neutral"
    complexity_score = Column(Float, default=50.0) # Flesch-Kincaid
    is_paradox = Column(Boolean, default=False)

    # Relationship to get children doors
    # Relationship to get children doors
    children = relationship("Room", back_populates="parent")
    parent = relationship("Room", back_populates="children", remote_side=[id])
    hints = relationship("Hint", back_populates="room")

class Hint(Base):
    __tablename__ = "hints"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    creator = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    room = relationship("Room", back_populates="hints")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String) # Hashed password
    current_room_id = Column(Integer, ForeignKey("rooms.id"), default=1)
    points = Column(Integer, default=0)
