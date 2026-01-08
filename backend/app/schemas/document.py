"""
Document Schemas - Request/Response models for document endpoints

Handles file upload validation and document metadata responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DocumentUpload(BaseModel):
    """Schema for document upload metadata (file comes via multipart/form-data)"""
    agent_id: Optional[int] = Field(None, description="Associate with specific agent (optional)")


class DocumentRead(BaseModel):
    """Schema for document API responses"""
    id: int
    filename: str
    file_size: Optional[int]
    file_type: Optional[str]
    processed: bool
    chunk_count: int
    error_message: Optional[str]
    user_id: int
    agent_id: Optional[int]
    created_at: datetime
    processed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class DocumentList(BaseModel):
    """Schema for paginated document list responses"""
    documents: List[DocumentRead]
    total: int


from typing import List
DocumentList.model_rebuild()
