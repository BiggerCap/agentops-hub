"""
AgentOps Hub API - Main Application Entry Point

This module initializes the FastAPI application with:
- CORS middleware for frontend communication
- Database table creation on startup
- All API routers (auth, agents, documents, runs, tools)
- Global exception handlers
- Health check endpoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1 import auth as auth_router
from app.api.v1 import agents as agents_router
from app.api.v1 import documents as documents_router
from app.api.v1 import runs as runs_router
from app.api.v1 import tools as tools_router
from app.api.v1 import conversations as conversations_router
from app.api.v1 import streaming as streaming_router
from app.core.config import settings
from app.core.exceptions import (
    AgentOpsException,
    agentops_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler,
)
from app.db.session import Base, engine

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="API for building, observing, and controlling AI agents",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(AgentOpsException, agentops_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Register API routers
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(agents_router.router, prefix="/api/v1")
app.include_router(documents_router.router, prefix="/api/v1")
app.include_router(runs_router.router, prefix="/api/v1")
app.include_router(tools_router.router, prefix="/api/v1")
app.include_router(conversations_router.router, prefix="/api/v1")
app.include_router(streaming_router.router, prefix="/api/v1")


@app.on_event("startup")
def on_startup() -> None:
    """
    Execute startup tasks:
    - Create all database tables if they don't exist
    - Initialize Qdrant collection for vector search
    """
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize Qdrant collection
    from app.ai.vectorstore_qdrant import initialize_collection
    initialize_collection()


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """
    Health check endpoint to verify API is running.

    Returns:
        dict: Status indicator
    """
    return {"status": "ok"}
