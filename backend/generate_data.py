import os
import random
from sqlalchemy import text
import database
import models
from riddles import RIDDLES

# 1. Ensure tables exist
models.Base.metadata.create_all(bind=database.engine)

def generate_simulation_data():
    print("Simulating realistic player data and trap rooms...")
    
    with database.engine.connect() as conn:
        # Get all existing rooms to attach new ones to
        existing_rooms = [r[0] for r in conn.execute(text("SELECT id FROM rooms")).fetchall()]
        if not existing_rooms:
            existing_rooms = [1]
            conn.execute(text("INSERT OR IGNORE INTO rooms (id, question, answer, creator) VALUES (1, 'Start?', 'yes', 'Admin')"))
            conn.commit()

        # --- 1. GENERATE COOL TRAP ROOMS ---
        new_rooms = [
            # Trap Room 1: High Complexity (Fog of War)
            {"q": "A labyrinthine conundrum wherein an entity incessantly devours yet is perpetually starved; its very existence is contingent upon the consumptive obliteration of its encompassing environment.", "a": "fire", "creator": "The_Architect", "s": "neutral", "cx": 25.0, "px": False},
            # Trap Room 2: Dark Sentiment
            {"q": "Blood flows where I walk. Death follows in my wake. I am the destroyer of hope, the bringer of endless screaming darkness.", "a": "war", "creator": "DoomBringer", "s": "dark", "cx": 65.0, "px": False},
            # Trap Room 3: Paradox Glitch
            {"q": "I am a statement that is entirely false. Everything I say is a lie, including this very sentence.", "a": "paradox", "creator": "GlitchWizard", "s": "neutral", "cx": 80.0, "px": True},
            # Trap Room 4: Joyous/Light
            {"q": "I am the feeling of sunshine on your face, the laughter of children, and the warmth of a loving embrace.", "a": "happiness", "creator": "RadiantSoul", "s": "light", "cx": 85.0, "px": False},
        ]

        # Add 15 random normal riddles from the database to expand the map
        selected_riddles = random.sample(RIDDLES, 15)
        for r in selected_riddles:
            new_rooms.append({
                "q": r[0], "a": r[1], "creator": "MazeBot", "s": "neutral", "cx": 70.0, "px": False
            })

        new_room_ids = []
        for r in new_rooms:
            # Attach to a random existing room
            parent = random.choice(existing_rooms)
            res = conn.execute(
                text("""
                    INSERT INTO rooms (question, answer, creator, parent_room_id, sentiment, complexity_score, is_paradox)
                    VALUES (:q, :a, :c, :p, :s, :cx, :px)
                    RETURNING id
                """),
                {"q": r["q"], "a": r["a"], "c": r["creator"], "p": parent, "s": r["s"], "cx": r["cx"], "px": r["px"]}
            )
            new_id = res.fetchone()[0]
            new_room_ids.append(new_id)
            existing_rooms.append(new_id) # Now other rooms can attach to this one too!
        
        conn.commit()

        # --- 2. GENERATE COOL BOTS SCATTERED ACROSS ALL ROOMS ---
        bots = [
            "NeonPhantom", "GhostInTheShell", "ZeroDay", "GlitchWizard", 
            "VoidWalker", "CyberSamurai", "ByteMe", "NullPointer", 
            "DataDemon", "QuantumRogue"
        ]
        
        for bot in bots:
            random_room = random.choice(existing_rooms)
            points = random.randint(100, 1500)
            conn.execute(
                text("""
                    INSERT INTO users (username, password, current_room_id, points) 
                    VALUES (:u, 'hashed_pwd', :r, :p)
                    ON CONFLICT(username) DO UPDATE SET current_room_id=:r, points=:p
                """),
                {"u": bot, "r": random_room, "p": points}
            )
        conn.commit()

        # --- 3. INJECT NLP FAILURES ACROSS ROOMS ---
        print("Injecting Collective Unconscious data (NLP)...")
        target_room = new_room_ids[0] # The "fire" trap room
        for _ in range(25):
            conn.execute(text("INSERT INTO failure_logs (room_id, guess) VALUES (:r, 'monster')"), {"r": target_room})
        for _ in range(8):
            conn.execute(text("INSERT INTO failure_logs (room_id, guess) VALUES (:r, 'beast')"), {"r": target_room})
        conn.commit()

        # --- 4. INJECT ISOLATION FOREST DATA ---
        print("Injecting Trap Predictor data (Isolation Forest)...")
        for rid in new_room_ids:
            # 20 normal solves per room
            for _ in range(20):
                t = random.uniform(15.0, 60.0)
                w = random.randint(0, 3)
                conn.execute(
                    text("INSERT INTO solve_logs (room_id, time_taken, wrong_guesses, hints_read) VALUES (:r, :t, :w, 0)"),
                    {"r": rid, "t": t, "w": w}
                )
            # 1 Speedrunner per room
            conn.execute(
                text("INSERT INTO solve_logs (room_id, time_taken, wrong_guesses, hints_read) VALUES (:r, 1.2, 0, 0)"),
                {"r": rid}
            )
            # 1 Stuck Player per room
            conn.execute(
                text("INSERT INTO solve_logs (room_id, time_taken, wrong_guesses, hints_read) VALUES (:r, 400.0, 18, 5)"),
                {"r": rid}
            )
            
        conn.commit()
        
        print("Data generation complete!")
        print(f"Generated {len(new_rooms)} new rooms attached to your existing maze.")
        print(f"Scattered {len(bots)} elite bots across all {len(existing_rooms)} rooms.")
        print("The Isolation Forest now has realistic solve data across all these rooms.")

if __name__ == "__main__":
    generate_simulation_data()
