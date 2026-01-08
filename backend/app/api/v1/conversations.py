"""
Conversation API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationOut,
    ConversationWithMessages
)
from app.services import conversation_service

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new conversation with an agent
    """
    return conversation_service.create_conversation(db, current_user.id, conversation)


@router.get("", response_model=List[ConversationOut])
def list_conversations(
    agent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all conversations for the current user
    
    Optional filters:
    - agent_id: Filter by specific agent
    """
    return conversation_service.get_conversations(
        db, current_user.id, agent_id, skip, limit
    )


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific conversation with all messages
    """
    conversation = conversation_service.get_conversation(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return conversation


@router.patch("/{conversation_id}", response_model=ConversationOut)
def update_conversation(
    conversation_id: int,
    conversation_update: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update conversation (e.g., change title)
    """
    conversation = conversation_service.update_conversation(
        db, conversation_id, current_user.id, conversation_update
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a conversation and all its messages
    """
    success = conversation_service.delete_conversation(db, conversation_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return None
