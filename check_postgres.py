import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def check_postgres():
    if not DATABASE_URL:
        print("No DATABASE_URL")
        return
        
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Checking users table columns in Postgres...")
        # Query to get column names for 'users' table
        query = text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        """)
        results = conn.execute(query).fetchall()
        for row in results:
            print(row)
            
        print("\nChecking first user data...")
        try:
            user = conn.execute(text("SELECT * FROM users LIMIT 1")).fetchone()
            print(user)
        except Exception as e:
            print(f"Error fetching user: {e}")

if __name__ == "__main__":
    check_postgres()
