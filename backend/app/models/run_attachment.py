"""
Run Attachment Model - Stores files attached to runs (for vision capabilities)
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class RunAttachment(Base):
    """
    Run attachment model for files attached to runs
    
    Enables vision capabilities by storing image attachments
    """
    __tablename__ = "run_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("runs.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # image/jpeg, image/png, etc.
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    run = relationship("Run", back_populates="attachments")
