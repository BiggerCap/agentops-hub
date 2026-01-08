"""
Document Service - Business logic for document management

Handles:
- Document upload and metadata creation
- File chunking and embedding
- Qdrant indexing
- Document deletion (removes from both DB and vectorstore)
"""

import os
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile
from app.models import Document
from app.schemas.document import DocumentUpload
from app.core.config import settings
from app.services.parsers import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_excel,
    extract_text_from_csv,
    extract_text_from_image
)


def create_document(
    db: Session,
    file: UploadFile,
    document_data: DocumentUpload,
    user_id: int,
) -> Document:
    """
    Create a new document and save the file.
    
    Args:
        db: Database session
        file: Uploaded file
        document_data: Document metadata
        user_id: Owner user ID
    
    Returns:
        Created document instance
    """
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    
    # Create document record
    document = Document(
        filename=file.filename,  # Use filename directly, not document_data.name
        file_path=file_path,
        file_size=os.path.getsize(file_path),
        file_type=file.content_type or "application/octet-stream",
        user_id=user_id,
        agent_id=document_data.agent_id,
        processed=False,  # Will be processed asynchronously
        chunk_count=0,
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Process document (chunk and embed)
    _process_document(db, document, user_id)
    
    return document


def _process_document(
    db: Session,
    document: Document,
    user_id: int,
) -> None:
    """
    Process a document: extract text, chunk, embed, and index in Qdrant.
    
    Supports multiple formats: PDF, DOCX, Excel, CSV, Images (OCR), and plain text.
    
    Args:
        db: Database session
        document: Document to process
        user_id: Owner user ID
    """
    try:
        # Extract file extension
        file_ext = os.path.splitext(document.file_path)[1].lower()
        
        # Extract text based on file type
        if file_ext == '.pdf':
            content = extract_text_from_pdf(document.file_path)
        elif file_ext == '.docx':
            content = extract_text_from_docx(document.file_path)
        elif file_ext in ['.xlsx', '.xls']:
            content = extract_text_from_excel(document.file_path)
        elif file_ext == '.csv':
            content = extract_text_from_csv(document.file_path)
        elif file_ext in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp', '.gif']:
            content = extract_text_from_image(document.file_path)
        else:
            # Default: read as plain text
            with open(document.file_path, "r", encoding="utf-8") as f:
                content = f.read()
        
        # Validate content
        if not content or not content.strip():
            raise ValueError(f"No text content extracted from {document.filename}")
        
        # Simple chunking (split by paragraphs, max 1000 chars per chunk)
        chunks = _chunk_text(content, max_chars=1000)
        
        # Generate chunk IDs as integers (doc_id * 10000 + chunk_index)
        # This ensures unique IDs across all documents
        chunk_ids = [document.id * 10000 + i for i in range(len(chunks))]
        
        # Add to Qdrant
        from app.ai.vectorstore_qdrant import add_documents
        add_documents(
            user_id=user_id,
            agent_id=document.agent_id,
            doc_id=document.id,
            chunks=chunks,
            chunk_ids=chunk_ids,
        )
        
        # Update document
        document.processed = True
        document.chunk_count = len(chunks)
        db.commit()
    
    except Exception as e:
        # Mark as failed and store error message
        document.processed = False
        document.error_message = str(e)
        db.commit()
        raise e


def _chunk_text(text: str, max_chars: int = 1000) -> List[str]:
    """
    Chunk text into smaller pieces.
    
    Uses a simple algorithm:
    1. Split by double newlines (paragraphs)
    2. If a paragraph is too long, split by sentences
    3. If a sentence is too long, split by words
    
    Args:
        text: Text to chunk
        max_chars: Maximum characters per chunk
    
    Returns:
        List of text chunks
    """
    chunks = []
    
    # Split by paragraphs
    paragraphs = text.split("\n\n")
    
    for para in paragraphs:
        if len(para) <= max_chars:
            chunks.append(para.strip())
        else:
            # Split by sentences
            sentences = para.split(". ")
            
            current_chunk = ""
            for sentence in sentences:
                if len(current_chunk) + len(sentence) <= max_chars:
                    current_chunk += sentence + ". "
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence + ". "
            
            if current_chunk:
                chunks.append(current_chunk.strip())
    
    return [c for c in chunks if c]  # Remove empty chunks


def get_document(
    db: Session,
    document_id: int,
    user_id: int,
) -> Optional[Document]:
    """
    Get a single document by ID (user isolation).
    
    Args:
        db: Database session
        document_id: Document ID
        user_id: Owner user ID
    
    Returns:
        Document instance or None
    """
    return db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id,
    ).first()


def get_documents(
    db: Session,
    user_id: int,
    agent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Document]:
    """
    Get all documents for a user (optionally filtered by agent).
    
    Args:
        db: Database session
        user_id: Owner user ID
        agent_id: Optional agent ID to filter by
        skip: Number of records to skip
        limit: Maximum records to return
    
    Returns:
        List of documents
    """
    query = db.query(Document).filter(Document.user_id == user_id)
    
    if agent_id:
        query = query.filter(Document.agent_id == agent_id)
    
    return query.offset(skip).limit(limit).all()


def delete_document(
    db: Session,
    document_id: int,
    user_id: int,
) -> bool:
    """
    Delete a document (removes from DB and Qdrant).
    
    Args:
        db: Database session
        document_id: Document ID
        user_id: Owner user ID
    
    Returns:
        True if deleted, False if not found
    """
    document = get_document(db, document_id, user_id)
    
    if not document:
        return False
    
    # Delete from Qdrant
    from app.ai.vectorstore_qdrant import delete_document as qdrant_delete
    qdrant_delete(
        user_id=user_id,
        agent_id=document.agent_id,
        doc_id=document_id
    )
    
    # Delete file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete from DB
    db.delete(document)
    db.commit()
    
    return True
