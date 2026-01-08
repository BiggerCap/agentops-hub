"""
Custom Exceptions and Error Handlers

Defines:
- Custom exception classes
- Global exception handlers for FastAPI
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError


class AgentOpsException(Exception):
    """Base exception for AgentOps application."""
    
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AgentOpsException):
    """Resource not found exception."""
    
    def __init__(self, resource: str, resource_id: int):
        message = f"{resource} with ID {resource_id} not found"
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)


class UnauthorizedException(AgentOpsException):
    """Unauthorized access exception."""
    
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(AgentOpsException):
    """Forbidden access exception."""
    
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN)


# Global exception handlers


async def agentops_exception_handler(request: Request, exc: AgentOpsException):
    """Handle custom AgentOps exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle SQLAlchemy database errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database error occurred"},
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
