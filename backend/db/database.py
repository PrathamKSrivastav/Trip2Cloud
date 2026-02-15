import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Define the path for the SQLite database file
# Since you are running from the /backend folder, this will point to /backend/metadata/
DB_PATH = os.path.join(os.getcwd(), "metadata", "Trip2Cloud.db")

# Ensure the metadata directory exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# For SQLite, check_same_thread=False is required for FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency generator to yield a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()