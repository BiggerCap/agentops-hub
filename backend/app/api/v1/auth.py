"""
Authentication API Endpoints

Provides user registration and login functionality with JWT token generation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserRead

# Create router with prefix and tags for API documentation
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password",
)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    """
    Register a new user account.

    Args:
        user_in: User registration data (email and password)
        db: Database session

    Returns:
        User: The newly created user object (password excluded)

    Raises:
        HTTPException: 400 if email already registered
    """
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user with hashed password
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Login to get access token",
    description="Authenticate with email and password to receive a JWT token",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """
    Authenticate user and generate JWT access token.

    Args:
        form_data: OAuth2 form with username (email) and password
        db: Database session

    Returns:
        Token: JWT access token for authentication

    Raises:
        HTTPException: 401 if credentials are invalid
        
    Note:
        The username field in OAuth2PasswordRequestForm is used for email
    """
    # Find user by email (username field contains email)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token
    access_token = create_access_token(subject=user.email)
    
    return Token(access_token=access_token)
