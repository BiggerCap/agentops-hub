"""
Security and Authentication Module

Provides password hashing and JWT token management for user authentication.
Uses bcrypt for password hashing and HS256 algorithm for JWT signing.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.

    Args:
        plain_password: The plain text password from user input
        hashed_password: The stored bcrypt hash

    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate a bcrypt hash from a plain text password.

    Args:
        password: The plain text password to hash

    Returns:
        str: Bcrypt hash of the password
    """
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token for authentication.

    Args:
        subject: The subject claim (typically user email or ID)
        expires_delta: Optional custom expiration time, defaults to ACCESS_TOKEN_EXPIRE_MINUTES

    Returns:
        str: Encoded JWT token
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"sub": subject, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and verify a JWT access token.

    Args:
        token: The JWT token to decode

    Returns:
        Optional[str]: The subject claim if valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        subject: str = payload.get("sub")
        
        if subject is None:
            return None
            
        return subject
    except JWTError:
        return None
