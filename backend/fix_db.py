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
            ("resume_url", "TEXT"),
            ("education", "TEXT"),
            ("projects", "TEXT"),
            ("linkedin_url", "TEXT"),
            ("github_url", "TEXT"),
            ("gender", "TEXT"),
            ("dob", "TEXT"),
            ("designation", "TEXT")
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

        # Fix applications table in SQLite
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='applications'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(applications)")
            existing_app = [col[1] for col in cursor.fetchall()]
            app_cols = [
                ("job_title", "TEXT"),
                ("portfolio_link", "TEXT"),
                ("Current_Location", "TEXT"),
                ("Total_Experience", "INTEGER"),
                ("Current_salary", "INTEGER"),
                ("Notice_Period", "INTEGER"),
                ("Cover_Letter", "TEXT"),
                ("status", "TEXT DEFAULT 'applied'"),
                ("applied_at", "DATETIME")
            ]
            for col_name, col_type in app_cols:
                if col_name not in existing_app:
                    print(f"Adding column '{col_name}' to SQLite applications...")
                    try:
                        cursor.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_type}")
                    except Exception as e:
                        print(f"Error adding {col_name} to SQLite applications: {e}")
            conn.commit()
        conn.close()
        print("SQLite fix done.")

    # 2. Handle PostgreSQL if configured
    if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
        print(f"Checking PostgreSQL at: {DATABASE_URL.split('@')[-1]}")
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                # 2.1 Handle Users Table
                users_cols = [
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
                
                for col_name, col_type in users_cols:
                    try:
                        check_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='{col_name}'")
                        result = conn.execute(check_query).fetchone()
                        if not result:
                            print(f"Adding column: {col_name} to PostgreSQL users")
                            conn.execute(text(f"alter table users add column {col_name} {col_type}"))
                            conn.commit()
                    except Exception as col_e:
                        print(f"Error handling users column {col_name}: {col_e}")

                # 2.2 Handle Applications Table
                app_cols = [
                    ("job_title", "VARCHAR(200)"),
                    ("portfolio_link", "VARCHAR(500)"),
                    ("Current_Location", "VARCHAR(150)"),
                    ("Total_Experience", "INTEGER"),
                    ("Current_salary", "INTEGER"),
                    ("Notice_Period", "INTEGER"),
                    ("Cover_Letter", "TEXT"),
                    ("status", "VARCHAR(50) DEFAULT 'applied'"),
                    ("applied_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                ]

                for col_name, col_type in app_cols:
                    try:
                        check_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='applications' AND column_name='{col_name}'")
                        result = conn.execute(check_query).fetchone()
                        if not result:
                            print(f"Adding column: {col_name} to PostgreSQL applications")
                            # We use double quotes for mixed case column names in Postgres if necessary, 
                            # but SQLAlchemy usually handles it. To be safe with information_schema:
                            conn.execute(text(f'alter table applications add column "{col_name}" {col_type}'))
                            conn.commit()
                    except Exception as col_e:
                        print(f"Error handling applications column {col_name}: {col_e}")

            print("PostgreSQL fix completed.")
        except Exception as e:
            print(f"PostgreSQL Fix Error: {e}")

if __name__ == "__main__":
    fix_database()
