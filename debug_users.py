from database.database import SessionLocal
from models.user import User

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users found: {len(users)}")
        for u in users:
            print(f"ID: {u.user_id}, Email: {u.email}, Role: {u.role}")
    except Exception as e:
        print(f"Error checking users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
