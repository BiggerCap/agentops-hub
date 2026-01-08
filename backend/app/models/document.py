"""
Document Model - Stores uploaded file metadata

Handles file uploads that get processed into embeddings for RAG.
Tracks processing status and chunk count.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Document(Base):
    """
    Document metadata model
    
    Stores information about uploaded files that are processed into vector embeddings
    """
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Local storage path
    file_size = Column(Integer, nullable=True)  # Size in bytes
    file_type = Column(String(50), nullable=True)  # pdf, txt, md
    
    # Processing status
    processed = Column(Boolean, default=False, nullable=False)
    chunk_count = Column(Integer, default=0)  # Number of text chunks created
    error_message = Column(Text, nullable=True)  # If processing failed
    
    # Ownership
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    agent = relationship("Agent", back_populates="documents")
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}', processed={self.processed})>"
