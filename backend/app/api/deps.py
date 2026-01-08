"""
API Dependencies

Provides reusable dependencies for FastAPI endpoints including:
- Database session management
- User authentication and authorization
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User

# OAuth2 bearer token scheme for authentication
# tokenUrl points to the login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db() -> Session:
    """
    Dependency that provides a database session.
    
    The session is automatically closed after the request completes.
    Use this in endpoint dependencies to access the database.

    Yields:
        Session: SQLAlchemy database session
        
    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency that extracts and validates the current authenticated user.
    
    Decodes the JWT token from the Authorization header and retrieves
    the corresponding user from the database.

    Args:
        token: JWT token from Authorization header
        db: Database session

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: 401 if token is invalid or user not found
        
    Example:
        @app.get("/me")
        def get_me(current_user: User = Depends(get_current_user)):
            return current_user
    """
    email = decode_access_token(token)
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user
