"""
Authentication Schemas

Defines data structures for authentication-related API responses.
"""

from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    JWT token response schema.

    Attributes:
        access_token: The JWT token string
        token_type: Always "bearer" for OAuth2 bearer tokens
    """

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Token payload data schema.

    Attributes:
        email: User's email address from the token
    """

    email: Optional[str] = None
