import sqlite3

conn = sqlite3.connect(r"C:\Users\tusha\.gemini\antigravity\scratch\escape_room\backend\escape_room.db")
cursor = conn.cursor()

# Get all rooms
cursor.execute("SELECT id, parent_room_id, is_active, question, sentiment, complexity_score, is_paradox FROM rooms")
rooms = cursor.fetchall()
print(f"Total rooms: {len(rooms)}")
for r in rooms[:10]:
    print(r)

print("\nUsers:")
cursor.execute("SELECT id, username, current_room_id FROM users")
print(cursor.fetchall())
conn.close()
