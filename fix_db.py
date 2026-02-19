import os
import sqlite3
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def fix_database():
    # 1. Always check and fix the local SQLite if it exists
    sqlite_db = "easyjobs.db"
    if os.path.exists(sqlite_db):
        print(f"Applying fix to local SQLite: {sqlite_db}")
        conn = sqlite3.connect(sqlite_db)
        cursor = conn.cursor()
        
        columns_to_add = [
            ("phone_number", "TEXT DEFAULT 'Not Provided'"),
            ("image", "TEXT"),
            ("bio", "TEXT"),
            ("location", "TEXT"),
            ("experience", "INTEGER"),
            ("salary", "INTEGER"),
            ("skills", "TEXT"),
            ("resume_url", "TEXT")
        ]
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(users)")
            existing = [col[1] for col in cursor.fetchall()]
            for col_name, col_type in columns_to_add:
                if col_name not in existing:
                    print(f"Adding column '{col_name}' to SQLite users...")
                    try:
                        cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                    except Exception as e:
                        print(f"Error adding {col_name} to SQLite: {e}")
            conn.commit()
        conn.close()
        print("SQLite fix done.")

    # 2. Handle PostgreSQL if configured
    if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
        print(f"Checking PostgreSQL at: {DATABASE_URL}")
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                columns_to_handle = [
                    ("phone_number", "VARCHAR(20) DEFAULT 'Not Provided'"),
                    ("image", "TEXT"),
                    ("bio", "TEXT"),
                    ("location", "VARCHAR(100)"),
                    ("experience", "INTEGER"),
                    ("salary", "INTEGER"),
                    ("skills", "TEXT"),
                    ("resume_url", "TEXT")
                ]
                
                for col_name, col_type in columns_to_handle:
                    try:
                        # Use a more generic query that works for Postgres
                        check_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='{col_name}'")
                        result = conn.execute(check_query).fetchone()
                        
                        if not result:
                            print(f"Adding missing column: {col_name} to PostgreSQL")
                            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                    except Exception as col_e:
                        print(f"Error handling PostgreSQL column {col_name}: {col_e}")
            print("PostgreSQL fix completed.")
        except Exception as e:
            print(f"PostgreSQL Fix Error: {e}")

if __name__ == "__main__":
    fix_database()
