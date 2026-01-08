"""
Conversation Schemas - Pydantic models for API validation
"""

from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List


# Message Schemas
class MessageBase(BaseModel):
    role: str
    content: str


class MessageCreate(MessageBase):
    conversation_id: int


class MessageOut(MessageBase):
    id: int
    conversation_id: int
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Conversation Schemas
class ConversationBase(BaseModel):
    title: Optional[str] = None


class ConversationCreate(ConversationBase):
    agent_id: int


class ConversationUpdate(BaseModel):
    title: Optional[str] = None


class ConversationOut(ConversationBase):
    id: int
    agent_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class ConversationWithMessages(ConversationOut):
    messages: List[MessageOut] = []
    
    model_config = ConfigDict(from_attributes=True)
