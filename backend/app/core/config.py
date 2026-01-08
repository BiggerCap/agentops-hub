"""
Configuration Management Module

Handles application settings and environment variables using Pydantic.
All sensitive configuration should be loaded from environment variables.
"""

import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """
    Application settings loaded from environment variables.

    Attributes:
        PROJECT_NAME: Name of the application
        API_V1_STR: API version prefix for routes
        POSTGRES_*: PostgreSQL database connection parameters
        JWT_SECRET: Secret key for JWT token signing
    """

    PROJECT_NAME: str = "AgentOps Hub API"
    API_V1_STR: str = "/api/v1"

    # PostgreSQL Configuration
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "agentops")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "agentops_password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "agentops_db")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5433")

    # Security Configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change_me_in_env")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Qdrant Configuration
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_COLLECTION_NAME: str = os.getenv("QDRANT_COLLECTION_NAME", "agentops_knowledge_base")

    # Application Settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """
        Construct PostgreSQL connection URI.

        Returns:
            str: PostgreSQL connection string in format:
                 postgresql://user:password@host:port/database
        """
        return (
            f"postgresql://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:"
            f"{self.POSTGRES_PORT}/"
            f"{self.POSTGRES_DB}"
        )


# Global settings instance
settings = Settings()
