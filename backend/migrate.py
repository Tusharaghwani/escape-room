import sqlite3
import urllib.request
import json
import ssl

# Bypass SSL verification if needed
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

API_URL = "https://escape-room-production-b75f.up.railway.app/api"

def main():
    conn = sqlite3.connect('escape_room.db')
    rooms = conn.execute('SELECT id, parent_room_id, question, answer, creator FROM rooms ORDER BY id ASC').fetchall()
    
    old_to_new = {None: None}
    
    print(f"Migrating {len(rooms)} rooms...")
    
    for r in rooms:
        old_id = r[0]
        old_parent = r[1]
        
        new_parent = old_to_new.get(old_parent)
        
        # Room 1 and 2 might already exist on the live server due to my previous script
        # So I will just blindly POST, but wait, if parent_room_id is 1, and 1 exists...
        # Wait, if I use the API, it creates a NEW room. 
        # I want to recreate the exact topology.
        
        data = {
            'parent_room_id': new_parent,
            'question': r[2],
            'answer': r[3],
            'creator': r[4]
        }
        
        req = urllib.request.Request(f"{API_URL}/rooms", headers={'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, data=json.dumps(data).encode('utf-8'), context=ctx) as response:
                res = json.loads(response.read().decode())
                new_id = res['id']
                old_to_new[old_id] = new_id
                print(f"Migrated old Room {old_id} -> new Room {new_id}")
        except Exception as e:
            print(f"Failed to migrate Room {old_id}: {e}")

if __name__ == '__main__':
    main()
