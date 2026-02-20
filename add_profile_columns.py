import os
import sqlite3
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
SQLITE_DB = "easyjobs.db"

def update_database():
    # 1. Update SQLite
    if os.path.exists(SQLITE_DB):
        print(f"--- Updating SQLite: {SQLITE_DB} ---")
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        
        columns_to_add = [
            ("phone_number", "TEXT DEFAULT 'Not Provided'"),
            ("image", "TEXT"),
            ("bio", "TEXT"),
            ("location", "TEXT"),
            ("experience", "INTEGER"),
            ("salary", "INTEGER"),
            ("skills", "TEXT"),
            ("resume_url", "TEXT"),
            ("education", "TEXT"),
            ("projects", "TEXT"),
            ("linkedin_url", "TEXT"),
            ("github_url", "TEXT"),
            ("gender", "TEXT"),
            ("dob", "TEXT"),
            ("designation", "TEXT")
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Added column: {col_name} to SQLite")
            except sqlite3.OperationalError:
                print(f"Column '{col_name}' already exists in SQLite")
                
        conn.commit()
        conn.close()

    # 2. Update PostgreSQL if configured
    if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
        print(f"\n--- Updating PostgreSQL: {DATABASE_URL.split('@')[-1]} ---")
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
                    ("resume_url", "TEXT"),
                    ("education", "TEXT"),
                    ("projects", "TEXT"),
                    ("linkedin_url", "TEXT"),
                    ("github_url", "TEXT"),
                    ("gender", "VARCHAR(20)"),
                    ("dob", "VARCHAR(50)"),
                    ("designation", "VARCHAR(100)")
                ]
                
                for col_name, col_type in columns_to_handle:
                    try:
                        # Check if column exists
                        check_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='{col_name}'")
                        result = conn.execute(check_query).fetchone()
                        
                        if not result:
                            print(f"Adding column '{col_name}' to PostgreSQL...")
                            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                        else:
                            print(f"Column '{col_name}' already exists in PostgreSQL")
                    except Exception as col_e:
                        print(f"Error handling PostgreSQL column {col_name}: {col_e}")
            print("PostgreSQL update complete.")
        except Exception as e:
            print(f"PostgreSQL Connection/Update Error: {e}")

if __name__ == "__main__":
    update_database()
