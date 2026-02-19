
import sqlite3
import os

DB_PATH = "easyjobs.db"

def update_schema():
    print(f"Connecting to database: {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 1. Create Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user'
        )
        """)

        # 2. Create Jobs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            job_id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_title TEXT,
            company_name TEXT,
            description TEXT,
            location TEXT,
            experience_level INTEGER,
            job_type TEXT,
            salary INTEGER,
            work_mode TEXT
        )
        """)

        # 3. Create Applications table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            application_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            job_id INTEGER,
            company_name TEXT,
            name TEXT,
            email TEXT,
            phone_number TEXT,
            portfolio_link TEXT,
            resume TEXT,
            Current_Location TEXT,
            Total_Experience INTEGER,
            Current_salary INTEGER,
            Notice_Period INTEGER,
            Cover_Letter TEXT,
            job_title TEXT,
            status TEXT DEFAULT 'applied',
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        )
        """)

        # 4. Create Saved Jobs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            job_id INTEGER NOT NULL,
            saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(user_id),
            FOREIGN KEY(job_id) REFERENCES jobs(job_id)
        )
        """)

        conn.commit()
        print("Database schema updated/created successfully!")
    except Exception as e:
        print(f"Error updating schema: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_schema()
