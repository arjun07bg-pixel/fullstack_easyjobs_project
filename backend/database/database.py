from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Get the directory of backend folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Default to SQLite if no DATABASE_URL is provided in .env
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    if not DATABASE_URL:
        raise ValueError("No DATABASE_URL found in .env")
    
    # Check if DATABASE_URL is for SQLite and handle properly if so
    if "sqlite" in DATABASE_URL:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # Supabase and other cloud DBs benefit from pool_pre_ping=True to handle stale connections
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    # Use absolute path for sqlite db
    DB_PATH = os.path.join(BASE_DIR, "easyjobs.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    print(f"⚠️ Falling back to local SQLite: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()