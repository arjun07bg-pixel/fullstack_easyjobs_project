
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
# Default to SQLite if no DATABASE_URL is provided in .env
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    if not DATABASE_URL:
        raise ValueError("No DATABASE_URL found in .env")
    
    engine = create_engine(DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    DATABASE_URL = "sqlite:///./easyjobs.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
