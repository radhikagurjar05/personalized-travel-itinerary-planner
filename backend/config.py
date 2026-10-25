import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "tripgenius-super-secret-key-dev-2026")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"

    # Database Configuration
    # Neon provides DATABASE_URL in postgres://... format.
    # SQLAlchemy 2.1+ defaults to psycopg (v3) driver; explicitly use psycopg2 since
    # the project depends on psycopg2-binary.
    raw_db_url = os.getenv("DATABASE_URL", "sqlite:///tripgenius.db")
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif raw_db_url.startswith("postgresql://"):
        raw_db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    SQLALCHEMY_DATABASE_URI = raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Engine options for PostgreSQL / Neon connection resilience
    if "postgresql" in raw_db_url:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 300,
        }
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {}

    # Generative AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # CORS configuration
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # JWT Authentication configuration
    JWT_EXPIRATION_DELTA = timedelta(days=7)
