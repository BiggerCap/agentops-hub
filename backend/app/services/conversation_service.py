"""
Conversation Service - Manage multi-turn conversations with agents
"""

from sqlalchemy.orm import Session
from app.models.conversation import Conversation, Message
from app.schemas.conversation import ConversationCreate, ConversationUpdate, MessageCreate
from typing import List, Optional
from fastapi import HTTPException


def create_conversation(
    db: Session,
    user_id: int,
    conversation_data: ConversationCreate
) -> Conversation:
    """Create a new conversation"""
    conversation = Conversation(
        agent_id=conversation_data.agent_id,
        user_id=user_id,
        title=conversation_data.title or "New Conversation"
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_conversation(
    db: Session,
    conversation_id: int,
    user_id: int
) -> Optional[Conversation]:
    """Get a conversation by ID"""
    return db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    ).first()


def get_conversations(
    db: Session,
    user_id: int,
    agent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Conversation]:
    """Get all conversations for a user"""
    query = db.query(Conversation).filter(Conversation.user_id == user_id)
    
    if agent_id:
        query = query.filter(Conversation.agent_id == agent_id)
    
    return query.order_by(Conversation.updated_at.desc()).offset(skip).limit(limit).all()


def update_conversation(
    db: Session,
    conversation_id: int,
    user_id: int,
    conversation_data: ConversationUpdate
) -> Optional[Conversation]:
    """Update conversation title"""
    conversation = get_conversation(db, conversation_id, user_id)
    if not conversation:
        return None
    
    if conversation_data.title is not None:
        conversation.title = conversation_data.title
    
    db.commit()
    db.refresh(conversation)
    return conversation


def delete_conversation(
    db: Session,
    conversation_id: int,
    user_id: int
) -> bool:
    """Delete a conversation"""
    conversation = get_conversation(db, conversation_id, user_id)
    if not conversation:
        return False
    
    db.delete(conversation)
    db.commit()
    return True


def add_message(
    db: Session,
    conversation_id: int,
    user_id: int,
    role: str,
    content: str
) -> Message:
    """Add a message to a conversation"""
    # Verify conversation belongs to user
    conversation = get_conversation(db, conversation_id, user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_conversation_history(
    db: Session,
    conversation_id: int,
    user_id: int
) -> List[dict]:
    """
    Get conversation history formatted for OpenAI
    
    Returns list of {"role": "user|assistant", "content": "..."}
    """
    conversation = get_conversation(db, conversation_id, user_id)
    if not conversation:
        return []
    
    return [
        {"role": msg.role, "content": msg.content}
        for msg in conversation.messages
    ]
