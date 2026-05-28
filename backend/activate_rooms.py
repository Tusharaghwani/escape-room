import sqlite3

conn = sqlite3.connect(r"C:\Users\tusha\.gemini\antigravity\scratch\escape_room\backend\escape_room.db")
cursor = conn.cursor()

# Update all rooms to be active if is_active is NULL or 0
cursor.execute("UPDATE rooms SET is_active = 1 WHERE is_active IS NULL OR is_active = 0")
conn.commit()

# Check count of active rooms now
cursor.execute("SELECT COUNT(*) FROM rooms WHERE is_active = 1")
print("Active rooms count:", cursor.fetchone()[0])

conn.close()
