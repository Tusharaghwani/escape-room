import database, models
from sqlalchemy.orm import Session

def seed():
    db = database.SessionLocal()
    
    # Check if Room 1 exists, if not, create it
    lobby = db.query(models.Room).filter(models.Room.id == 1).first()
    if not lobby:
        lobby = models.Room(
            id=1,
            question="Welcome to the Infinite Escape Room. I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
            answer="echo",
            creator="The Architect"
        )
        db.add(lobby)
        db.commit()
    
    # Path A
    room_2 = models.Room(parent_room_id=1, question="I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer="map", creator="MazeBot")
    db.add(room_2)
    db.commit()
    db.refresh(room_2)
    
    # Path B
    room_3 = models.Room(parent_room_id=1, question="What gets wetter the more it dries?", answer="towel", creator="MazeBot")
    db.add(room_3)
    db.commit()
    db.refresh(room_3)
    
    # Path A1
    room_4 = models.Room(parent_room_id=room_2.id, question="What comes once in a minute, twice in a moment, but never in a thousand years?", answer="m", creator="MazeBot")
    db.add(room_4)
    db.commit()
    
    # Path A2
    room_5 = models.Room(parent_room_id=room_2.id, question="The more you take, the more you leave behind. What are they?", answer="footsteps", creator="MazeBot")
    db.add(room_5)
    db.commit()

    # Path B1
    room_6 = models.Room(parent_room_id=room_3.id, question="I shave every day, but my beard stays the same. What am I?", answer="barber", creator="MazeBot")
    db.add(room_6)
    db.commit()

    print("Seed complete! Added 5 bot rooms.")
    db.close()

if __name__ == "__main__":
    seed()
