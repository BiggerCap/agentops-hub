"""
Conversation Model - Stores multi-turn conversations with agents

Each conversation represents a persistent chat session between a user and an agent.
Messages within the conversation maintain context across multiple runs.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Conversation(Base):
    """
    Conversation model for persistent agent-user chat sessions
    
    Enables agents to maintain context across multiple interactions
    """
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)  # Auto-generated or user-provided
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    agent = relationship("Agent", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.id")
    runs = relationship("Run", back_populates="conversation")


class Message(Base):
    """
    Message model for individual messages within a conversation
    
    Stores each message in the conversation history
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
