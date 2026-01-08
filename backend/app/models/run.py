"""
Run Model - Stores agent execution sessions

Each run represents one task execution by an agent.
Tracks status, timing, input/output, and errors.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class RunStatus(str, enum.Enum):
    """Status of agent run execution"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Run(Base):
    """
    Agent execution run model
    
    Represents one task execution session with full lifecycle tracking
    """
    __tablename__ = "runs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Input/Output
    input_text = Column(Text, nullable=False)  # User's task/query
    output_text = Column(Text, nullable=True)  # Agent's final response
    
    # Status tracking
    status = Column(
        SQLEnum(RunStatus), 
        default=RunStatus.PENDING, 
        nullable=False, 
        index=True
    )
    error_message = Column(Text, nullable=True)
    
    # Ownership
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="runs")
    agent = relationship("Agent", back_populates="runs")
    conversation = relationship("Conversation", back_populates="runs")
    steps = relationship("RunStep", back_populates="run", cascade="all, delete-orphan", order_by="RunStep.step_order")
    attachments = relationship("RunAttachment", back_populates="run", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Run(id={self.id}, status='{self.status}', agent_id={self.agent_id})>"
