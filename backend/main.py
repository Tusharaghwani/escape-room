from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import models
import schemas
import database
import string
import hashlib
from sqlalchemy import func, text
import json

models.Base.metadata.create_all(bind=database.engine)

# Quick migration for existing DBs
for migration_sql in [
    "ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0",
    "CREATE TABLE IF NOT EXISTS failure_logs (id INTEGER PRIMARY KEY, room_id INTEGER, guess TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS solve_logs (id INTEGER PRIMARY KEY, room_id INTEGER, time_taken REAL, wrong_guesses INTEGER, hints_read INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "CREATE TABLE IF NOT EXISTS user_solved_rooms (id INTEGER PRIMARY KEY, username TEXT, room_id INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(username, room_id))",
    "ALTER TABLE rooms ADD COLUMN sentiment TEXT DEFAULT 'neutral'",
    "ALTER TABLE rooms ADD COLUMN complexity_score REAL DEFAULT 50.0",
    "ALTER TABLE rooms ADD COLUMN is_paradox BOOLEAN DEFAULT 0",
]:
    try:
        with database.engine.connect() as conn:
            conn.execute(text(migration_sql))
            conn.commit()
    except Exception:
        pass

import riddles as riddle_bank
import random

app = FastAPI()

# ─── System 2: Trap Predictor (Isolation Forest) ───────────────────────────
import threading
import time as _time
import numpy as np
from sklearn.ensemble import IsolationForest

_if_model = None          # The live trained model
_if_lock = threading.Lock()
_if_last_trained = 0.0
_IF_MIN_SAMPLES = 5       # Need at least 5 solved rooms before training
_IF_RETRAIN_EVERY = 30    # Retrain at most every 30 seconds

def _retrain_model():
    """Trains a fresh IsolationForest on all solve logs. Called in a daemon thread."""
    global _if_model, _if_last_trained
    try:
        with database.engine.connect() as conn:
            rows = conn.execute(
                text("SELECT time_taken, wrong_guesses, hints_read FROM solve_logs")
            ).fetchall()
        if len(rows) < _IF_MIN_SAMPLES:
            return
        X = np.array([[r[0], r[1], r[2]] for r in rows], dtype=float)
        model = IsolationForest(contamination=0.15, random_state=42, n_estimators=50)
        model.fit(X)
        with _if_lock:
            _if_model = model
            _if_last_trained = _time.time()
        print(f"[TrapPredictor] Model retrained on {len(rows)} solve logs.")
    except Exception as e:
        print(f"[TrapPredictor] Training failed: {e}")

def _maybe_retrain():
    """Triggers a background retrain if the cooldown has passed."""
    if _time.time() - _if_last_trained > _IF_RETRAIN_EVERY:
        t = threading.Thread(target=_retrain_model, daemon=True)
        t.start()

def _detect_anomaly(time_taken: float, wrong_guesses: int, hints_read: int):
    """
    Scores the player's current behavior against the trained model.
    Returns a dict describing the anomaly type, or None if behavior is normal.
    """
    with _if_lock:
        model = _if_model
    if model is None:
        return None
    try:
        X = np.array([[time_taken, wrong_guesses, hints_read]], dtype=float)
        prediction = model.predict(X)[0]   # 1 = normal, -1 = anomaly
        score = float(model.decision_function(X)[0])  # lower = more anomalous
        if prediction == -1:
            # Classify the anomaly type by dominant feature
            if time_taken < 8 and wrong_guesses == 0:
                return {"type": "speed_runner", "score": score,
                        "label": "⚡ Speed-Runner Detected",
                        "detail": "You solved this suspiciously fast. The maze has noticed."}
            elif wrong_guesses >= 5:
                return {"type": "stuck", "score": score,
                        "label": "🌀 Stuck Pattern Detected",
                        "detail": "The Collective has seen this struggle before. A nudge has been injected."}
            else:
                return {"type": "outlier", "score": score,
                        "label": "👁 Unusual Behavior Detected",
                        "detail": "Your pattern does not match any known agent profile."}
    except Exception as e:
        print(f"[TrapPredictor] Detect failed: {e}")
    return None
# ────────────────────────────────────────────────────────────────────────────


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to clean text
def normalize_text(text: str) -> str:
    if not text:
        return ""
    # Lowercase and strip
    text = text.lower().strip()
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text

# BFS to find distance to nearest leaf (dead end)
def get_distance_to_edge(db: Session, start_room_id: int) -> int:
    queue = [(start_room_id, 0)]
    visited = set()
    while queue:
        curr_id, dist = queue.pop(0)
        if curr_id in visited:
            continue
        visited.add(curr_id)
        
        # Get active children
        children = db.query(models.Room.id).filter(
            models.Room.parent_room_id == curr_id, 
            models.Room.is_active == True
        ).all()
        
        if not children:
            return dist  # Reached a leaf
            
        for child in children:
            queue.append((child.id, dist + 1))
            
    return 0

@app.post("/api/rooms", response_model=schemas.RoomResponse)
def create_room(room: schemas.RoomCreate, db: Session = Depends(database.get_db)):
    # --- ML PROCESSING ---
    sentiment = "neutral"
    complexity = 50.0
    is_paradox = False
    
    if not room.theme_override:
        # Use Gemini for lightweight theme classification to avoid heavy PyTorch RAM usage
        try:
            prompt = f"""Analyze this riddle: "{room.question}"
Classify it by sentiment (light, dark, or neutral), complexity (0.0 to 100.0, where 20.0 is very complex/foggy, and 80.0 is simple), and paradox (true if it's a logical paradox, false otherwise).
Return EXACTLY a JSON string like: {{"sentiment": "dark", "complexity": 30.5, "is_paradox": false}}"""
            res = client.models.generate_content(
                model='gemini-2.0-flash-exp',
                contents=prompt
            )
            text_ans = res.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(text_ans)
            sentiment = data.get("sentiment", "neutral")
            complexity = float(data.get("complexity", 50.0))
            is_paradox = bool(data.get("is_paradox", False))
        except Exception as e:
            print(f"[ML] Gemini Classification Failed: {e}")
            pass
    
    # Apply user theme override if provided
    if room.theme_override:
        if room.theme_override == "paradox":
            is_paradox = True
            complexity = 50.0
            sentiment = "neutral"
        elif room.theme_override == "fog":
            complexity = 20.0
            is_paradox = False
        elif room.theme_override in ["light", "dark", "neutral"]:
            sentiment = room.theme_override
            is_paradox = False
            complexity = 60.0

    db_room = models.Room(
        parent_room_id=room.parent_room_id,
        question=room.question,
        answer=room.answer,
        creator=room.creator,
        sentiment=sentiment,
        complexity_score=complexity,
        is_paradox=is_paradox
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    
    # Update creator's points
    points_awarded = 0
    if not room.is_auto_generated and room.creator and room.creator != "Anonymous":
        user = db.query(models.User).filter(models.User.username == room.creator).first()
        if user:
            user.points += 25
            points_awarded = 25
            db.commit()
    
    # Log activity
    if points_awarded > 0:
        msg = f"🔥 {room.creator} forged a new path at Room #{room.parent_room_id} and earned {points_awarded} points!"
    else:
        msg = f"✨ {room.creator} summoned an AI-generated door at Room #{room.parent_room_id}!"
    log = models.ActivityLog(message=msg)
    db.add(log)
    db.commit()
    
    return db_room

@app.post("/api/analyze")
def analyze_text(request: schemas.AnalyzeRequest):
    sentiment = "neutral"
    complexity = 50.0
    is_paradox = False
    try:
        prompt = f"""Analyze this riddle: "{request.text}"
Classify it by sentiment (light, dark, or neutral), complexity (0.0 to 100.0, where 20.0 is very complex/foggy, and 80.0 is simple), and paradox (true if it's a logical paradox, false otherwise).
Return EXACTLY a JSON string like: {{"sentiment": "dark", "complexity": 30.5, "is_paradox": false}}"""
        res = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=prompt
        )
        text_ans = res.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text_ans)
        sentiment = data.get("sentiment", "neutral")
        complexity = float(data.get("complexity", 50.0))
        is_paradox = bool(data.get("is_paradox", False))
    except Exception:
        pass

    return {
        "sentiment": sentiment,
        "complexity_score": complexity,
        "is_paradox": is_paradox
    }

@app.get("/api/rooms/{room_id}", response_model=schemas.RoomDetail)
def get_room(room_id: int, db: Session = Depends(database.get_db)):
    room = db.query(models.Room).filter(models.Room.id == room_id, models.Room.is_active == True).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    doors = db.query(models.Room).filter(models.Room.parent_room_id == room_id, models.Room.is_active == True).all()
    hints = db.query(models.Hint).filter(models.Hint.room_id == room_id).order_by(models.Hint.created_at.desc()).all()
    
    distance = get_distance_to_edge(db, room_id)
    
    return {
        "id": room.id,
        "parent_room_id": room.parent_room_id,
        "question": room.question,
        "creator": room.creator,
        "sentiment": room.sentiment or "neutral",
        "complexity_score": room.complexity_score if room.complexity_score is not None else 50.0,
        "is_paradox": bool(room.is_paradox),
        "doors": doors,
        "hints": hints,
        "distance_to_edge": distance
    }

@app.post("/api/rooms/{door_id}/solve")
def solve_door(door_id: int, request: schemas.GuessRequest, db: Session = Depends(database.get_db)):
    door = db.query(models.Room).filter(models.Room.id == door_id, models.Room.is_active == True).first()
    if not door:
        raise HTTPException(status_code=404, detail="Door not found")
        
    db_answer_clean = normalize_text(door.answer)
    guess_clean = normalize_text(request.guess)
    
    import difflib
    # NLP Fuzzy Match: Substring or high similarity
    is_correct = False
    
    if getattr(door, 'is_paradox', False):
        # Paradox Override: If the room is a paradox, the ONLY answer is 'paradox'
        if guess_clean == "paradox":
            is_correct = True
    else:
        # Support multiple comma-separated answers
        db_answers = [ans.strip() for ans in db_answer_clean.split(",")] if "," in db_answer_clean else [db_answer_clean]
        
        for ans in db_answers:
            if ans == guess_clean:
                is_correct = True
                break
            elif (guess_clean in ans or ans in guess_clean) and len(guess_clean) >= 4:
                is_correct = True
                break
            elif difflib.SequenceMatcher(None, guess_clean, ans).ratio() > 0.8:
                is_correct = True
                break

    
    if is_correct:
        # Update user's current room and award points (anti-farming: only once per room)
        already_solved = False
        if request.username:
            user = db.query(models.User).filter(models.User.username == request.username).first()
            if user:
                user.current_room_id = door.id
                # Check if user has already solved this room
                try:
                    with database.engine.connect() as conn:
                        existing = conn.execute(
                            text("SELECT id FROM user_solved_rooms WHERE username=:u AND room_id=:r"),
                            {"u": request.username, "r": door_id}
                        ).fetchone()
                        if existing:
                            already_solved = True
                        else:
                            # First time solving — mark as solved and award points
                            conn.execute(
                                text("INSERT OR IGNORE INTO user_solved_rooms (username, room_id) VALUES (:u, :r)"),
                                {"u": request.username, "r": door_id}
                            )
                            conn.commit()
                            points_to_add = 20 if getattr(door, 'is_paradox', False) else 10
                            user.points += points_to_add
                except Exception as e:
                    print(f"[AntiFarm] {e}")
                db.commit()

        # ── System 2: Log this solve for the Trap Predictor ──────────────
        try:
            with database.engine.connect() as conn:
                conn.execute(
                    text("INSERT INTO solve_logs (room_id, time_taken, wrong_guesses, hints_read) "
                         "VALUES (:room_id, :time_taken, :wrong_guesses, :hints_read)"),
                    {"room_id": door_id,
                     "time_taken": request.time_taken or 0,
                     "wrong_guesses": request.wrong_guesses or 0,
                     "hints_read": request.hints_read or 0}
                )
                conn.commit()
        except Exception as e:
            print(f"[SolveLog] Failed: {e}")

        # Trigger background model retrain
        _maybe_retrain()

        # ─────────────────────────────────────────────────────────────────
        pts = 20 if getattr(door, 'is_paradox', False) else 10
        solver = request.username or "Someone"
        msg = f"⚡ {solver} solved Room #{door.id} and earned {pts} points!" if not already_solved else \
              f"🔄 {solver} revisited Room #{door.id} (no bonus points)."
        log = models.ActivityLog(message=msg)
        db.add(log)
        db.commit()
        return {"success": True, "new_room_id": door.id, "points_awarded": not already_solved, "points_gained": pts if not already_solved else 0}

    else:
        # ── System 1: Log failure for Collective Unconscious ──────────────
        try:
            with database.engine.connect() as conn:
                conn.execute(text("INSERT INTO failure_logs (room_id, guess) VALUES (:room_id, :guess)"),
                             {"room_id": door_id, "guess": request.guess})
                conn.commit()
        except Exception:
            pass

        # ── System 2: Run anomaly detection on this wrong guess ───────────
        anomaly = _detect_anomaly(
            time_taken=request.time_taken or 0,
            wrong_guesses=request.wrong_guesses or 0,
            hints_read=request.hints_read or 0
        )

        # If "stuck" anomaly → inject an auto-nudge hint into this room
        if anomaly and anomaly["type"] == "stuck":
            try:
                nudge = f"🤖 The Maze AI detected you are stuck. Hint: Think about what '{door.answer[0]}...' could relate to."
                db_hint = models.Hint(room_id=door_id, creator="🧠 Trap Predictor", message=nudge)
                db.add(db_hint)
                db.commit()
                anomaly["hint_injected"] = True
            except Exception:
                pass

        # ─────────────────────────────────────────────────────────────────
        return {"success": False, "message": "Incorrect answer.", "anomaly": anomaly}

@app.post("/api/rooms/{room_id}/hints", response_model=schemas.HintResponse)
def add_hint(room_id: int, hint: schemas.HintCreate, db: Session = Depends(database.get_db)):
    db_room = db.query(models.Room).filter(models.Room.id == room_id, models.Room.is_active == True).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    db_hint = models.Hint(
        room_id=room_id,
        creator=hint.creator,
        message=hint.message
    )
    db.add(db_hint)
    db.commit()
    db.refresh(db_hint)
    return db_hint

@app.delete("/api/rooms/{room_id}")
def delete_room(room_id: int, secret_key: str, db: Session = Depends(database.get_db)):
    if secret_key != "super_secret_maze_master_99":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    room.is_active = False
    db.commit()
    return {"success": True, "message": "Room deactivated"}

@app.get("/api/maze/tree")
def get_maze_tree(username: Optional[str] = None, db: Session = Depends(database.get_db)):
    rooms = db.query(models.Room).filter(models.Room.is_active == True).all()
    
    # Fetch solved rooms for the user
    solved_ids = set()
    if username:
        try:
            with database.engine.connect() as conn:
                rows = conn.execute(
                    text("SELECT room_id FROM user_solved_rooms WHERE username = :u"),
                    {"u": username}
                ).fetchall()
                solved_ids = {r[0] for r in rows}
        except Exception:
            pass

    # Build child-count map to identify leaf nodes
    child_counts = {r.id: 0 for r in rooms}
    for r in rooms:
        if r.parent_room_id and r.parent_room_id in child_counts:
            child_counts[r.parent_room_id] += 1

    room_dict = {
        r.id: {
            "name": f"Room #{r.id}",
            "attributes": {
                "creator": r.creator,
                "is_leaf": child_counts[r.id] == 0,
                "sentiment": r.sentiment or "neutral",
                "is_paradox": bool(r.is_paradox),
                "complexity_score": r.complexity_score if r.complexity_score is not None else 50.0,
                "is_solved": r.id in solved_ids or r.id == 1, # Root is always "solved"/unlocked
                "parent_room_id": r.parent_room_id
            },
            "children": []
        } 
        for r in rooms
    }
    
    tree = []
    for r in rooms:
        if r.parent_room_id is None or r.parent_room_id not in room_dict:
            tree.append(room_dict[r.id])
        else:
            room_dict[r.parent_room_id]["children"].append(room_dict[r.id])
            
    return tree

@app.get("/api/activity", response_model=List[schemas.ActivityLogResponse])
def get_activity(db: Session = Depends(database.get_db)):
    logs = db.query(models.ActivityLog).order_by(models.ActivityLog.created_at.desc()).limit(5).all()
    return logs

# --- Auth Endpoints ---

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    new_user = models.User(
        username=user.username,
        password=hash_password(user.password),
        current_room_id=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.UserResponse)
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or db_user.password != hash_password(user.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return db_user

@app.post("/api/users/{username}/move")
def move_user(username: str, room_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user:
        db_user.current_room_id = room_id
        db.commit()
    return {"success": True}

# --- Heatmap Endpoint ---

@app.get("/api/maze/heatmap")
def get_heatmap(db: Session = Depends(database.get_db)):
    # Returns a mapping of room_id to number of active users
    results = db.query(models.User.current_room_id, func.count(models.User.id)).group_by(models.User.current_room_id).all()
    return {room_id: count for room_id, count in results if room_id is not None}

# --- Leaderboard Endpoint ---

@app.get("/api/leaderboard", response_model=List[schemas.UserResponse])
def get_leaderboard(db: Session = Depends(database.get_db)):
    users = db.query(models.User).order_by(models.User.points.desc()).limit(10).all()
    return users

# --- ML Status Endpoint (for evaluators / transparency) ---

@app.get("/api/ml/status")
def get_ml_status():
    """Returns the live status of both ML systems — great for demos."""
    import time as t
    with _if_lock:
        model_trained = _if_model is not None
        last_trained = _if_last_trained

    try:
        with database.engine.connect() as conn:
            solve_count = conn.execute(text("SELECT COUNT(*) FROM solve_logs")).scalar()
            failure_count = conn.execute(text("SELECT COUNT(*) FROM failure_logs")).scalar()
    except Exception:
        solve_count = 0
        failure_count = 0

    return {
        "system_1_collective_unconscious": {
            "status": "active",
            "failure_logs_total": failure_count,
            "description": "NLP token-frequency analysis on wrong guesses to surface misconception warnings"
        },
        "system_2_trap_predictor": {
            "status": "trained" if model_trained else f"waiting_for_data (need {_IF_MIN_SAMPLES} solves, have {solve_count})",
            "model": "IsolationForest (sklearn)" if model_trained else None,
            "solve_logs_total": solve_count,
            "last_trained_seconds_ago": round(t.time() - last_trained) if last_trained > 0 else None,
            "description": "Anomaly detection on player behavior (time_taken, wrong_guesses, hints_read)"
        }
    }


# --- Collective Unconscious: ML Warning System ---

@app.get("/api/rooms/{room_id}/warnings")
def get_room_warnings(room_id: int):
    """
    Collective Unconscious: Analyzes all historical wrong guesses for a room
    and extracts the most common misconception pattern to warn future players.
    Uses token frequency analysis (lightweight NLP, zero external dependencies).
    """
    try:
        with database.engine.connect() as conn:
            rows = conn.execute(
                text("SELECT guess FROM failure_logs WHERE room_id = :room_id ORDER BY created_at DESC LIMIT 200"),
                {"room_id": room_id}
            ).fetchall()
    except Exception:
        return {"warning": None, "total_failures": 0}

    if len(rows) < 3:
        return {"warning": None, "total_failures": len(rows)}

    # Lightweight NLP: tokenize and count word frequencies from wrong guesses
    from collections import Counter
    import re
    stop_words = {"the","a","an","is","it","of","and","or","to","in","i","my","me","be","what","this","that"}
    word_counts = Counter()
    for row in rows:
        tokens = re.findall(r'\b[a-zA-Z]+\b', row[0].lower())
        for t in tokens:
            if t not in stop_words:
                word_counts[t] += 1

    if not word_counts:
        return {"warning": None, "total_failures": len(rows)}

    # Top misconception keyword
    top_word, top_count = word_counts.most_common(1)[0]
    pct = round((top_count / len(rows)) * 100)

    if pct < 20:  # Not significant enough to show a warning
        return {"warning": None, "total_failures": len(rows)}

    warning = f"ROOM #{room_id}: {pct}% of agents who attempted this room focused on '{top_word}'. They never made it out."
    return {"warning": warning, "total_failures": len(rows), "top_misconception": top_word, "pct": pct}

# --- Riddle Generator (Local Bank, Zero Cost, No Repeats) ---

@app.get("/api/riddles/generate")
def generate_riddle():
    """
    Returns a random riddle from the local bank that hasn't been used in the maze yet.
    Checks the existing rooms DB to prevent duplicate questions.
    Zero API cost, instant response.
    """
    try:
        # Fetch all questions already used in the maze
        used_questions = set()
        with database.engine.connect() as conn:
            rows = conn.execute(text("SELECT question FROM rooms")).fetchall()
            used_questions = {normalize_text(r[0]) for r in rows}
    except Exception:
        used_questions = set()

    # Filter out riddles already in the maze
    available = [
        (q, a) for q, a in riddle_bank.RIDDLES
        if normalize_text(q) not in used_questions
    ]

    if not available:
        return {"question": None, "answer": None, "message": "All riddles have been used! The maze is truly infinite."}

    question, answer = random.choice(available)
    return {"question": question, "answer": answer}
@app.post("/api/upload_db")
async def upload_db(request: Request):
    data = await request.body()
    import os
    db_url = os.getenv("DATABASE_URL", "sqlite:///./escape_room.db")
    db_path = db_url.replace("sqlite:///", "")
    with open(db_path, "wb") as f:
        f.write(data)
    return {"message": "Database uploaded successfully"}
