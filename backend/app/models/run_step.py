"""
RunStep Model - Detailed execution logs for observability

CRITICAL FOR INTERVIEW: This is the "killer feature"

Every action during agent execution is logged as a step:
- LLM calls with prompts and responses
- Tool calls with arguments and results
- Errors with stack traces
- Final answers

This enables full execution timeline visualization.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class StepType(str, enum.Enum):
    """Type of execution step for categorization"""
    LLM_CALL = "llm_call"          # Model inference
    TOOL_CALL = "tool_call"        # Tool invocation
    TOOL_RESULT = "tool_result"    # Tool response
    ERROR = "error"                # Execution error
    FINAL_ANSWER = "final_answer"  # Agent's final response


class RunStep(Base):
    """
    Execution step log model
    
    Captures every action during agent execution for observability.
    Enables detailed timeline view of agent's decision-making process.
    """
    __tablename__ = "run_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Step metadata
    step_order = Column(Integer, nullable=False, index=True)  # Sequential order in run
    step_type = Column(SQLEnum(StepType), nullable=False)
    
    # Step data (stored as JSON for flexibility)
    input_data = Column(JSON, nullable=True)   # e.g., {"prompt": "...", "model": "gpt-4"}
    output_data = Column(JSON, nullable=True)  # e.g., {"response": "...", "tokens": 150}
    
    # For tool calls
    tool_name = Column(String(100), nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    # Timing (for performance analysis)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    duration_ms = Column(Integer, nullable=True)  # Execution time in milliseconds
    
    # Relationships
    run = relationship("Run", back_populates="steps")
    
    def __repr__(self):
        return f"<RunStep(id={self.id}, run_id={self.run_id}, type='{self.step_type}', order={self.step_order})>"
