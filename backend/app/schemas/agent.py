"""
Agent Schemas - Request/Response models for agent endpoints

Handles validation for agent creation, updates, and API responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AgentBase(BaseModel):
    """Base schema with common agent fields"""
    name: str = Field(..., min_length=1, max_length=100, description="Agent name")
    description: Optional[str] = Field(None, description="Optional agent description")
    system_prompt: str = Field(..., min_length=10, description="Instructions for the LLM")
    kb_enabled: bool = Field(default=False, description="Enable knowledge base (RAG)")


class AgentCreate(AgentBase):
    """Schema for creating a new agent"""
    tool_ids: List[int] = Field(default=[], description="List of tool IDs to attach")


class AgentUpdate(BaseModel):
    """Schema for updating an existing agent (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    system_prompt: Optional[str] = Field(None, min_length=10)
    kb_enabled: Optional[bool] = None
    tool_ids: Optional[List[int]] = None


class AgentRead(AgentBase):
    """Schema for agent API responses"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Include attached tools in response
    tools: List["ToolRead"] = []
    
    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)


class AgentList(BaseModel):
    """Schema for paginated agent list responses"""
    agents: List[AgentRead]
    total: int


# Forward references need to be resolved after all schemas are defined
from app.schemas.tool import ToolRead
AgentRead.model_rebuild()
