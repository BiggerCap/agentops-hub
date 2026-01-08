"""
Database Session Management

Configures SQLAlchemy engine, session factory, and declarative base.
All models should inherit from Base to be included in migrations.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Create database engine
# echo=False disables SQL query logging (set to True for debugging)
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, echo=False)

# Session factory for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for ORM models
Base = declarative_base()
