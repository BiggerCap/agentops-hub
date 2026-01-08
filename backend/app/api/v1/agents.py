"""
Agents API Router - REST endpoints for agent management

Endpoints:
- POST /agents - Create agent
- GET /agents - List agents
- GET /agents/{id} - Get agent details
- PUT /agents/{id} - Update agent
- DELETE /agents/{id} - Delete agent
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentUpdate, AgentRead, AgentList
from app.services import agent_service


router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
def create_agent(
    agent_data: AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new agent.
    
    Args:
        agent_data: Agent creation data
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Created agent with full details
    """
    try:
        agent = agent_service.create_agent(
            db=db,
            agent_data=agent_data,
            user_id=current_user.id,
        )
        return agent
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=AgentList)
def list_agents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all agents for the current user.
    
    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum records to return
        db: Database session
        current_user: Authenticated user
    
    Returns:
        List of agents
    """
    agents = agent_service.get_agents(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    
    return AgentList(agents=agents, total=len(agents))


@router.get("/{agent_id}", response_model=AgentRead)
def get_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single agent by ID.
    
    Args:
        agent_id: Agent ID
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Agent with full details
    """
    agent = agent_service.get_agent(
        db=db,
        agent_id=agent_id,
        user_id=current_user.id,
    )
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    return agent


@router.put("/{agent_id}", response_model=AgentRead)
def update_agent(
    agent_id: int,
    agent_data: AgentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an agent.
    
    Args:
        agent_id: Agent ID
        agent_data: Update data (all fields optional)
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Updated agent
    """
    agent = agent_service.update_agent(
        db=db,
        agent_id=agent_id,
        user_id=current_user.id,
        agent_data=agent_data,
    )
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
    
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an agent (cascades to documents and runs).
    
    Args:
        agent_id: Agent ID
        db: Database session
        current_user: Authenticated user
    
    Returns:
        No content
    """
    deleted = agent_service.delete_agent(
        db=db,
        agent_id=agent_id,
        user_id=current_user.id,
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )
