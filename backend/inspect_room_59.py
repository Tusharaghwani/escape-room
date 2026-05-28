import sqlite3

conn = sqlite3.connect(r"C:\Users\tusha\.gemini\antigravity\scratch\escape_room\backend\escape_room.db")
cursor = conn.cursor()

# Get room 59 details
cursor.execute("SELECT id, parent_room_id, is_active, question, answer, creator, sentiment, complexity_score, is_paradox FROM rooms WHERE id = 59")
print("Room 59:", cursor.fetchone())

conn.close()
