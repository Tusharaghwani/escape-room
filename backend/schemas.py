from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HintBase(BaseModel):
    message: str
    creator: str

class HintCreate(HintBase):
    pass

class HintResponse(HintBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    question: str
    creator: str

class RoomCreate(RoomBase):
    answer: str
    parent_room_id: Optional[int] = None
    theme_override: Optional[str] = None
    is_auto_generated: bool = False

class RoomResponse(RoomBase):
    id: int
    parent_room_id: Optional[int]
    sentiment: str = "neutral"
    complexity_score: float = 50.0
    is_paradox: bool = False
    class Config:
        from_attributes = True

class ActivityLogBase(BaseModel):
    message: str

class ActivityLogResponse(ActivityLogBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class RoomDetail(RoomResponse):
    doors: List[RoomResponse] = []
    hints: List[HintResponse] = []
    distance_to_edge: int = 0

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    current_room_id: Optional[int] = None
    points: int
    class Config:
        from_attributes = True

class GuessRequest(BaseModel):
    guess: str
    username: Optional[str] = None
    time_taken: Optional[float] = 0.0   # seconds spent in this room so far
    wrong_guesses: Optional[int] = 0    # wrong attempts so far in this room
    hints_read: Optional[int] = 0       # number of hints the player has read

class AnalyzeRequest(BaseModel):
    text: str
