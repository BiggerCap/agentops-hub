"""
Agent Model - Stores AI agent configurations

Each agent has:
- System prompt (instructions for the LLM)
- Selected tools (capabilities like SQL, vector search, HTTP)
- Knowledge base toggle (enable/disable RAG)
- User ownership (for multi-tenancy)
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


# Many-to-many association table for agents and tools
agent_tools = Table(
    'agent_tools',
    Base.metadata,
    Column('agent_id', Integer, ForeignKey('agents.id', ondelete='CASCADE'), primary_key=True),
    Column('tool_id', Integer, ForeignKey('tools.id', ondelete='CASCADE'), primary_key=True)
)


class Agent(Base):
    """
    AI Agent configuration model
    
    Represents an autonomous agent that can execute tasks using LLMs and tools
    """
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=False)  # Instructions for the LLM
    kb_enabled = Column(Boolean, default=False)  # Enable knowledge base (RAG)
    
    # User ownership
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="agents")
    tools = relationship("Tool", secondary=agent_tools, back_populates="agents")
    documents = relationship("Document", back_populates="agent", cascade="all, delete-orphan")
    runs = relationship("Run", back_populates="agent", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="agent", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Agent(id={self.id}, name='{self.name}', user_id={self.user_id})>"
