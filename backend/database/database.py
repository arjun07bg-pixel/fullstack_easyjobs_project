from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

<<<<<<< HEAD
# Get the directory of backend folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

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
    # Use absolute path for sqlite db
    DB_PATH = os.path.join(BASE_DIR, "easyjobs.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    print(f"⚠️ Falling back to local SQLite: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
=======
# Default SQLite database (local run)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./easyjobs.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
>>>>>>> a40fdfebe27c4604f34940a046c81aa58b0b117f

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()