import os
import sqlite3
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv("backend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")

def fix_database():
    # 1. Handle SQLite if it exists
    sqlite_db = "./backend/easyjobs.db"
    if os.path.exists(sqlite_db):
        print(f"Applying fix to local SQLite: {sqlite_db}")
        try:
            conn = sqlite3.connect(sqlite_db)
            cursor = conn.cursor()
            
            # Helper to check/add columns in SQLite
            def ensure_sqlite_col(table, col, definition):
                cursor.execute(f"PRAGMA table_info({table})")
                cols = [c[1] for c in cursor.fetchall()]
                if col not in cols:
                    print(f"Adding SQLite column: {table}.{col}")
                    cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {definition}")

            ensure_sqlite_col("users", "phone_number", "TEXT DEFAULT 'Not Provided'")
            ensure_sqlite_col("users", "image", "TEXT")
            ensure_sqlite_col("users", "company_name", "TEXT")
            ensure_sqlite_col("users", "role", "TEXT DEFAULT 'user'")
            
            ensure_sqlite_col("applications", "job_title", "TEXT")
            ensure_sqlite_col("applications", "Current_Location", "TEXT")
            ensure_sqlite_col("applications", "job_type", "TEXT DEFAULT 'Full Time'")
            ensure_sqlite_col("applications", "status", "TEXT DEFAULT 'applied'")
            
            conn.commit()
            conn.close()
            print("SQLite fix done.")
        except Exception as e:
            print(f"SQLite Fix Error: {e}")

    # 2. Handle PostgreSQL / Supabase
    if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
        print(f"Verifying Supabase Schema...")
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                # 2.1 Ensure Tables Exist (Fallback in case metadata.create_all failed)
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS users (
                        user_id SERIAL PRIMARY KEY,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        password VARCHAR(255) NOT NULL,
                        phone_number VARCHAR(20),
                        role VARCHAR(50) DEFAULT 'user'
                    );
                """))
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS applications (
                        application_id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(user_id),
                        job_id INTEGER,
                        company_name VARCHAR(200),
                        status VARCHAR(50) DEFAULT 'applied'
                    );
                """))
                conn.commit()

                # 2.2 Detailed Column Checks
                tables_to_check = {
                    "users": [
                        ("phone_number", "VARCHAR(50) DEFAULT 'Not Provided'"),
                        ("image", "TEXT"),
                        ("bio", "TEXT"),
                        ("location", "VARCHAR(255)"),
                        ("experience", "INTEGER"),
                        ("salary", "INTEGER"),
                        ("skills", "TEXT"),
                        ("resume_url", "TEXT"),
                        ("company_name", "VARCHAR(255)"),
                        ("company_size", "VARCHAR(150)"),
                        ("industry", "VARCHAR(255)"),
                        ("company_website", "VARCHAR(500)"),
                        ("designation", "VARCHAR(255)"),
                        ("role", "VARCHAR(100) DEFAULT 'user'"),
                        ("gender", "VARCHAR(100)"),
                        ("dob", "VARCHAR(100)"),
                        ("education", "TEXT"),
                        ("projects", "TEXT"),
                        ("linkedin_url", "VARCHAR(500)"),
                        ("github_url", "VARCHAR(500)"),
                        ("portfolio_link", "TEXT")
                    ],
                    "applications": [
                        ("job_title", "VARCHAR(255)"),
                        ("name", "VARCHAR(255)"),
                        ("email", "VARCHAR(255)"),
                        ("phone_number", "VARCHAR(50)"),
                        ("portfolio_link", "TEXT"),
                        ("resume", "TEXT"),
                        ("Current_Location", "VARCHAR(255)"),
                        ("Total_Experience", "INTEGER"),
                        ("Current_salary", "INTEGER"),
                        ("Notice_Period", "INTEGER"),
                        ("Cover_Letter", "TEXT"),
                        ("job_type", "VARCHAR(100) DEFAULT 'Full Time'"),
                        ("applied_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                    ],
                    "jobs": [
                        ("job_title", "VARCHAR(255)"),
                        ("company_name", "VARCHAR(255)"),
                        ("location", "VARCHAR(255)"),
                        ("job_type", "VARCHAR(255)"),
                        ("work_mode", "VARCHAR(255)"),
                        ("category", "VARCHAR(255)"),
                        ("deadline", "VARCHAR(255)"),
                        ("company_website", "VARCHAR(500)"),
                        ("apply_link", "VARCHAR(500)")
                    ]
                }

                for table, columns in tables_to_check.items():
                    print(f"Fixing table: {table}")
                    for col_name, col_type in columns:
                        try:
                            # 1. Ensure Column Exists
                            check_query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='{col_name.lower()}'")
                            result = conn.execute(check_query).fetchone()
                            if not result:
                                print(f"  + Adding missing column: {col_name}")
                                conn.execute(text(f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS "{col_name}" {col_type}'))
                                conn.commit()
                            else:
                                # 2. Force Type Update (to handle "value too long" errors)
                                # e.g. change VARCHAR(50) to VARCHAR(255)
                                if "VARCHAR" in col_type.upper() or "TEXT" in col_type.upper():
                                    print(f"  * Updating type for: {col_name}")
                                    # Extract pure type without DEFAULT
                                    pure_type = col_type.split("DEFAULT")[0].strip()
                                    conn.execute(text(f'ALTER TABLE {table} ALTER COLUMN "{col_name}" TYPE {pure_type}'))
                                    conn.commit()
                        except Exception as col_err:
                            print(f"  ! Error on {table}.{col_name}: {col_err}")

                # 2.3 Constraint Fixes
                try:
                    conn.execute(text('ALTER TABLE applications ALTER COLUMN job_id DROP NOT NULL'))
                    conn.commit()
                except: pass

            print("[SUCCESS] Supabase/PostgreSQL schema check complete.")
        except Exception as e:
            print(f"[ERROR] Supabase Fix Error: {e}")

if __name__ == "__main__":
    fix_database()
