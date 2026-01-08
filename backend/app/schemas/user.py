"""
User Schemas (Pydantic Models)

Defines data validation and serialization schemas for user-related API endpoints.
"""

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """
    Base user schema with shared fields.

    Attributes:
        email: User's email address (validated format)
    """

    email: EmailStr


class UserCreate(UserBase):
    """
    Schema for user registration requests.

    Attributes:
        password: Plain text password (will be hashed before storage)
    """

    password: str


class UserRead(UserBase):
    """
    Schema for user responses (excludes sensitive data).

    Attributes:
        id: User's unique identifier
    """

    id: int

    class Config:
        from_attributes = True  # Updated from orm_mode in Pydantic v2
