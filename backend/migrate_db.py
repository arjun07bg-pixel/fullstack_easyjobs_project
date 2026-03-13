"""
Migration script: Add missing columns to the jobs table in PostgreSQL (Supabase).
Run this ONCE to sync the database with the Job model.
"""
import os
import sys

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from database.database import engine
from sqlalchemy import text

MIGRATIONS = [
    # (column_name, column_definition)
    ("category",         "VARCHAR(100)"),
    ("vacancies",        "INTEGER"),
    ("deadline",         "VARCHAR(50)"),
    ("company_website",  "VARCHAR(255)"),
    ("apply_link",       "VARCHAR(255)"),
    ("required_skills",  "TEXT"),
    ("employer_id",      "INTEGER"),
]

def column_exists(conn, table, column):
    result = conn.execute(text(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_name = :tbl AND column_name = :col"
    ), {"tbl": table, "col": column})
    return result.fetchone() is not None

def run_migrations():
    print("🔄 Running database migrations for 'jobs' table...\n")
    with engine.connect() as conn:
        for col_name, col_type in MIGRATIONS:
            if column_exists(conn, "jobs", col_name):
                print(f"  ✅ Column '{col_name}' already exists — skipping.")
            else:
                try:
                    conn.execute(text(
                        f"ALTER TABLE jobs ADD COLUMN {col_name} {col_type}"
                    ))
                    conn.commit()
                    print(f"  ➕ Added column '{col_name}' ({col_type})")
                except Exception as e:
                    print(f"  ❌ Error adding '{col_name}': {e}")
                    conn.rollback()

        # Also check applications table for any missing columns
        APPS_MIGRATIONS = [
            ("job_title",        "VARCHAR(200)"),
            ("Current_Location", "VARCHAR(150)"),
            ("Total_Experience", "INTEGER"),
            ("Current_salary",   "INTEGER"),
            ("Notice_Period",    "INTEGER"),
            ("Cover_Letter",     "TEXT"),
            ("job_type",         "VARCHAR(50)"),
            ("portfolio_link",   "VARCHAR(500)"),
        ]
        print("\n🔄 Checking 'applications' table...\n")
        for col_name, col_type in APPS_MIGRATIONS:
            if column_exists(conn, "applications", col_name):
                print(f"  ✅ Column '{col_name}' already exists — skipping.")
            else:
                try:
                    conn.execute(text(
                        f"ALTER TABLE applications ADD COLUMN \"{col_name}\" {col_type}"
                    ))
                    conn.commit()
                    print(f"  ➕ Added column '{col_name}' ({col_type})")
                except Exception as e:
                    print(f"  ❌ Error adding '{col_name}': {e}")
                    conn.rollback()

    print("\n✅ Migration complete!")

if __name__ == "__main__":
    run_migrations()
