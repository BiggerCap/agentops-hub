"""
Documents API Router - REST endpoints for document management

Endpoints:
- POST /documents - Upload document
- GET /documents - List documents
- GET /documents/{id} - Get document details
- DELETE /documents/{id} - Delete document
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
import io

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.document import DocumentUpload, DocumentRead, DocumentList
from app.services import document_service
from app.services.youtube_service import get_youtube_transcript


router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentTextUpload(BaseModel):
    """Schema for uploading text content directly"""
    agent_id: int = Field(..., description="Agent ID to attach document to")
    content: str = Field(..., min_length=1, description="Text content")
    filename: str = Field(..., min_length=1, description="Document filename")
    metadata: Optional[dict] = Field(default=None, description="Optional metadata")


class YouTubeUpload(BaseModel):
    """Schema for uploading YouTube video transcripts"""
    agent_id: int = Field(..., description="Agent ID to attach document to")
    url: str = Field(..., min_length=1, description="YouTube video URL")
    include_timestamps: bool = Field(default=True, description="Include timestamps in transcript")


@router.post("/upload", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document_file(
    file: UploadFile = File(...),
    agent_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a document file for an agent's knowledge base.
    
    Args:
        file: File to upload (PDF, TXT, MD, etc.)
        agent_id: Agent to attach document to
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Created document with metadata
    """
    try:
        # Create document data (DocumentUpload only has agent_id)
        document_data = DocumentUpload(
            agent_id=agent_id,
        )
        
        # Upload and process
        document = document_service.create_document(
            db=db,
            file=file,
            document_data=document_data,
            user_id=current_user.id,
        )
        
        return document
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document_text(
    data: DocumentTextUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a text document directly via JSON (for Postman/API testing).
    
    Args:
        data: Document text content and metadata
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Created document with metadata
    """
    try:
        # Create document data (DocumentUpload only has agent_id)
        document_data = DocumentUpload(
            agent_id=data.agent_id,
        )
        
        # Create a fake file object from text content
        text_bytes = data.content.encode('utf-8')
        fake_file = UploadFile(
            filename=data.filename,
            file=io.BytesIO(text_bytes),
        )
        
        # Upload and process
        document = document_service.create_document(
            db=db,
            file=fake_file,
            document_data=document_data,
            user_id=current_user.id,
        )
        
        return document
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=DocumentList)
def list_documents(
    agent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all documents for the current user.
    
    Args:
        agent_id: Optional agent ID to filter by
        skip: Number of records to skip (pagination)
        limit: Maximum records to return
        db: Database session
        current_user: Authenticated user
    
    Returns:
        List of documents
    """
    documents = document_service.get_documents(
        db=db,
        user_id=current_user.id,
        agent_id=agent_id,
        skip=skip,
        limit=limit,
    )
    
    return DocumentList(documents=documents, total=len(documents))


@router.get("/{document_id}", response_model=DocumentRead)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single document by ID.
    
    Args:
        document_id: Document ID
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Document with full details
    """
    document = document_service.get_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a document (removes from DB and Qdrant).
    
    Args:
        document_id: Document ID
        db: Database session
        current_user: Authenticated user
    
    Returns:
        No content
    """
    deleted = document_service.delete_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )


@router.post("/youtube", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_youtube_transcript(
    data: YouTubeUpload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Extract transcript from a YouTube video and add it to agent's knowledge base.
    
    Args:
        data: YouTube video URL and settings
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Created document with transcript content
    """
    try:
        # Extract transcript from YouTube
        transcript_data = get_youtube_transcript(
            url=data.url,
            include_timestamps=data.include_timestamps
        )
        
        # Use formatted transcript (with timestamps) or plain text
        content = transcript_data["transcript"] if data.include_timestamps else transcript_data["transcript_plain"]
        
        # Create filename from video ID
        filename = f"youtube_{transcript_data['video_id']}.txt"
        
        # Create document data
        document_data = DocumentUpload(agent_id=data.agent_id)
        
        # Create a fake file object from transcript content
        text_bytes = content.encode('utf-8')
        fake_file = UploadFile(
            filename=filename,
            file=io.BytesIO(text_bytes),
        )
        
        # Upload and process
        document = document_service.create_document(
            db=db,
            file=fake_file,
            document_data=document_data,
            user_id=current_user.id,
        )
        
        return document
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process YouTube video: {str(e)}",
        )
