"""
Tools API Router - REST endpoints for tool discovery

Endpoints:
- GET /tools - List all available tools
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.tool import Tool
from app.schemas.tool import ToolList


router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("", response_model=ToolList)
def list_tools(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all available tools.
    
    Tools are pre-seeded in the database.
    Users can attach them to agents during creation/update.
    
    Args:
        db: Database session
        current_user: Authenticated user
    
    Returns:
        List of all available tools with schemas
    """
    tools = db.query(Tool).all()
    
    return {"tools": tools}
