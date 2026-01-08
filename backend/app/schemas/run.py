"""
Run Schemas - Request/Response models for run endpoints

Handles agent execution requests and responses with detailed status tracking.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.run import RunStatus


class RunCreate(BaseModel):
    """Schema for starting a new agent run"""
    agent_id: int = Field(..., description="ID of agent to execute")
    input_text: str = Field(..., min_length=1, description="Task/query for the agent")
    conversation_id: Optional[int] = Field(None, description="Optional conversation ID for persistent chat history")


class RunRead(BaseModel):
    """Schema for run API responses"""
    id: int
    input_text: str
    output_text: Optional[str]
    status: RunStatus
    error_message: Optional[str]
    user_id: int
    agent_id: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    # Include agent name for convenience
    agent_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class RunWithSteps(RunRead):
    """Schema for run with full execution timeline"""
    steps: List["RunStepRead"] = []


class RunList(BaseModel):
    """Schema for paginated run list responses"""
    runs: List[RunRead]
    total: int


# Forward reference resolution
from app.schemas.run_step import RunStepRead
RunWithSteps.model_rebuild()
