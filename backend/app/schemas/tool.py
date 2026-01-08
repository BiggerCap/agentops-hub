"""
Tool Schemas - Request/Response models for tool endpoints

Defines the schema for tool metadata exposed via API.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ToolRead(BaseModel):
    """Schema for tool API responses"""
    id: int
    name: str
    description: str
    enabled: bool
    config_schema: Optional[Dict[str, Any]] = Field(None, description="JSON schema for tool parameters")
    
    class Config:
        from_attributes = True


class ToolList(BaseModel):
    """Schema for tool list responses"""
    tools: List[ToolRead]
