"""
Agent Service - Business logic for agent management

Handles:
- CRUD operations for agents
- Tool attachment/detachment
- Knowledge base configuration
- Agent deletion (cascades to documents and runs)
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Agent, Tool
from app.schemas.agent import AgentCreate, AgentUpdate


def create_agent(
    db: Session,
    agent_data: AgentCreate,
    user_id: int,
) -> Agent:
    """
    Create a new agent.
    
    Args:
        db: Database session
        agent_data: Agent creation data
        user_id: Owner user ID
    
    Returns:
        Created agent instance
    """
    # Create agent
    agent = Agent(
        name=agent_data.name,
        description=agent_data.description,
        system_prompt=agent_data.system_prompt,
        kb_enabled=agent_data.kb_enabled,
        user_id=user_id,
    )
    
    # Attach tools
    if agent_data.tool_ids:
        tools = db.query(Tool).filter(Tool.id.in_(agent_data.tool_ids)).all()
        agent.tools = tools
    
    db.add(agent)
    db.commit()
    db.refresh(agent)
    
    return agent


def get_agent(
    db: Session,
    agent_id: int,
    user_id: int,
) -> Optional[Agent]:
    """
    Get a single agent by ID (user isolation).
    
    Args:
        db: Database session
        agent_id: Agent ID
        user_id: Owner user ID
    
    Returns:
        Agent instance or None
    """
    return db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == user_id,
    ).first()


def get_agents(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> List[Agent]:
    """
    Get all agents for a user (paginated).
    
    Args:
        db: Database session
        user_id: Owner user ID
        skip: Number of records to skip
        limit: Maximum records to return
    
    Returns:
        List of agents
    """
    return db.query(Agent).filter(
        Agent.user_id == user_id
    ).offset(skip).limit(limit).all()


def update_agent(
    db: Session,
    agent_id: int,
    user_id: int,
    agent_data: AgentUpdate,
) -> Optional[Agent]:
    """
    Update an agent.
    
    Args:
        db: Database session
        agent_id: Agent ID
        user_id: Owner user ID
        agent_data: Update data (all fields optional)
    
    Returns:
        Updated agent or None if not found
    """
    agent = get_agent(db, agent_id, user_id)
    
    if not agent:
        return None
    
    # Update fields if provided
    if agent_data.name is not None:
        agent.name = agent_data.name
    
    if agent_data.description is not None:
        agent.description = agent_data.description
    
    if agent_data.system_prompt is not None:
        agent.system_prompt = agent_data.system_prompt
    
    if agent_data.kb_enabled is not None:
        agent.kb_enabled = agent_data.kb_enabled
    
    # Update tools if provided
    if agent_data.tool_ids is not None:
        tools = db.query(Tool).filter(Tool.id.in_(agent_data.tool_ids)).all()
        agent.tools = tools
    
    db.commit()
    db.refresh(agent)
    
    return agent


def delete_agent(
    db: Session,
    agent_id: int,
    user_id: int,
) -> bool:
    """
    Delete an agent (cascades to documents and runs).
    
    Args:
        db: Database session
        agent_id: Agent ID
        user_id: Owner user ID
    
    Returns:
        True if deleted, False if not found
    """
    agent = get_agent(db, agent_id, user_id)
    
    if not agent:
        return False
    
    # Clean up Qdrant documents
    from app.ai.vectorstore_qdrant import delete_agent_documents
    delete_agent_documents(user_id, agent_id)
    
    # Delete agent (cascades to documents and runs via DB)
    db.delete(agent)
    db.commit()
    
    return True


def attach_tools(
    db: Session,
    agent_id: int,
    user_id: int,
    tool_ids: List[int],
) -> Optional[Agent]:
    """
    Attach tools to an agent.
    
    Args:
        db: Database session
        agent_id: Agent ID
        user_id: Owner user ID
        tool_ids: Tool IDs to attach
    
    Returns:
        Updated agent or None if not found
    """
    agent = get_agent(db, agent_id, user_id)
    
    if not agent:
        return None
    
    # Get tools
    tools = db.query(Tool).filter(Tool.id.in_(tool_ids)).all()
    
    # Add to existing tools (don't replace)
    agent.tools.extend([t for t in tools if t not in agent.tools])
    
    db.commit()
    db.refresh(agent)
    
    return agent


def detach_tools(
    db: Session,
    agent_id: int,
    user_id: int,
    tool_ids: List[int],
) -> Optional[Agent]:
    """
    Detach tools from an agent.
    
    Args:
        db: Database session
        agent_id: Agent ID
        user_id: Owner user ID
        tool_ids: Tool IDs to detach
    
    Returns:
        Updated agent or None if not found
    """
    agent = get_agent(db, agent_id, user_id)
    
    if not agent:
        return None
    
    # Remove tools
    agent.tools = [t for t in agent.tools if t.id not in tool_ids]
    
    db.commit()
    db.refresh(agent)
    
    return agent


def toggle_knowledge_base(
    db: Session,
    agent_id: int,
    user_id: int,
    enabled: bool,
) -> Optional[Agent]:
    """
    Enable/disable knowledge base for an agent.
    
    Args:
        db: Database session
        agent_id: Agent ID
        user_id: Owner user ID
        enabled: Whether to enable KB
    
    Returns:
        Updated agent or None if not found
    """
    agent = get_agent(db, agent_id, user_id)
    
    if not agent:
        return None
    
    agent.kb_enabled = enabled
    
    db.commit()
    db.refresh(agent)
    
    return agent
