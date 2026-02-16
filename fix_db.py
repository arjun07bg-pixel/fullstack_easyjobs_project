import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def fix_database():
    if not DATABASE_URL:
        print("No DATABASE_URL found. Skipping PostgreSQL fix.")
        return

    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # 1. Add missing columns with correct types
            columns_to_handle = [
                ("bio", "TEXT"),
                ("location", "VARCHAR(100)"),
                ("experience", "INTEGER"),
                ("salary", "INTEGER"),
                ("skills", "TEXT"),
                ("resume_url", "TEXT")
            ]
            
            for col_name, col_type in columns_to_handle:
                try:
                    # Check if column exists
                    query = text(f"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='{col_name}'")
                    result = conn.execute(query).fetchone()
                    
                    if not result:
                        print(f"Adding missing column: {col_name}")
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                    else:
                        # Ensure columns that should be TEXT are TEXT (upgrading from VARCHAR)
                        if col_type == "TEXT":
                            conn.execute(text(f"ALTER TABLE users ALTER COLUMN {col_name} TYPE TEXT"))
                            conn.commit()

                except Exception as col_e:
                    print(f"Error handling column {col_name}: {col_e}")

            # 2. Specifically upgrade 'image' column to TEXT if it exists as VARCHAR
            try:
                conn.execute(text("ALTER TABLE users ALTER COLUMN image TYPE TEXT"))
                conn.commit()
            except:
                pass

    except Exception as e:
        print(f"Database Fix Error: {e}")
        pass

if __name__ == "__main__":
    fix_database()
