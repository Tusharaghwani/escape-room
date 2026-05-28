import sqlite3

conn = sqlite3.connect(r"C:\Users\tusha\.gemini\antigravity\scratch\escape_room\backend\escape_room.db")
cursor = conn.cursor()

# Get all rooms with parent room ids
cursor.execute("SELECT id, parent_room_id, is_active FROM rooms")
rooms = cursor.fetchall()
print("Rooms in DB:")
for r in rooms:
    print(r)

conn.close()
