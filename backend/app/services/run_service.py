"""
Run Service - Business logic for agent execution

Handles:
- Run creation
- Execution orchestration (delegates to runner.py)
- Status checking
- Run history retrieval
"""

import asyncio
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Run, RunStatus, Agent
from app.schemas.run import RunCreate
from app.ai.runner import execute_run


def create_run(
    db: Session,
    run_data: RunCreate,
    user_id: int,
) -> Run:
    """
    Create a new run.
    
    Args:
        db: Database session
        run_data: Run creation data
        user_id: Owner user ID
    
    Returns:
        Created run instance
    """
    # Verify agent exists and belongs to user
    agent = db.query(Agent).filter(
        Agent.id == run_data.agent_id,
        Agent.user_id == user_id,
    ).first()
    
    if not agent:
        raise ValueError(f"Agent {run_data.agent_id} not found")
    
    # Verify conversation exists if provided
    if run_data.conversation_id:
        from app.models.conversation import Conversation
        conversation = db.query(Conversation).filter(
            Conversation.id == run_data.conversation_id,
            Conversation.user_id == user_id,
        ).first()
        
        if not conversation:
            raise ValueError(f"Conversation {run_data.conversation_id} not found")
    
    # Create run
    run = Run(
        agent_id=run_data.agent_id,
        input_text=run_data.input_text,
        conversation_id=run_data.conversation_id,
        status=RunStatus.PENDING,
        user_id=user_id,
    )
    
    db.add(run)
    db.commit()
    db.refresh(run)
    
    return run


async def execute_run_async(
    run_id: int,
    db: Session,
) -> None:
    """
    Execute a run asynchronously.
    
    This should be called in a background task.
    
    Args:
        run_id: Run ID to execute
        db: Database session
    """
    # Get run
    run = db.query(Run).filter(Run.id == run_id).first()
    
    if not run:
        return
    
    # Get agent
    agent = db.query(Agent).filter(Agent.id == run.agent_id).first()
    
    if not agent:
        run.status = RunStatus.FAILED
        run.error_message = "Agent not found"
        db.commit()
        return
    
    # Execute
    await execute_run(
        run_id=run_id,
        agent=agent,
        input_text=run.input_text,
        db=db,
        user_id=run.user_id,
        conversation_id=run.conversation_id,
    )


def start_run_execution(
    run_id: int,
    db: Session,
) -> None:
    """
    Start run execution in the background.
    
    Args:
        run_id: Run ID to execute
        db: Database session
    """
    # In production, this would use Celery or similar
    # For now, we'll run in a thread pool to avoid blocking
    import threading
    
    def run_in_thread():
        # Create new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(execute_run_async(run_id, db))
        finally:
            loop.close()
    
    thread = threading.Thread(target=run_in_thread, daemon=True)
    thread.start()


def get_run(
    db: Session,
    run_id: int,
    user_id: int,
) -> Optional[Run]:
    """
    Get a single run by ID (user isolation).
    
    Args:
        db: Database session
        run_id: Run ID
        user_id: Owner user ID
    
    Returns:
        Run instance or None
    """
    return db.query(Run).filter(
        Run.id == run_id,
        Run.user_id == user_id,
    ).first()


def get_runs(
    db: Session,
    user_id: int,
    agent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Run]:
    """
    Get all runs for a user (optionally filtered by agent).
    
    Args:
        db: Database session
        user_id: Owner user ID
        agent_id: Optional agent ID to filter by
        skip: Number of records to skip
        limit: Maximum records to return
    
    Returns:
        List of runs
    """
    query = db.query(Run).filter(Run.user_id == user_id)
    
    if agent_id:
        query = query.filter(Run.agent_id == agent_id)
    
    return query.order_by(Run.created_at.desc()).offset(skip).limit(limit).all()


def delete_run(
    db: Session,
    run_id: int,
    user_id: int,
) -> bool:
    """
    Delete a run (cascades to steps).
    
    Args:
        db: Database session
        run_id: Run ID
        user_id: Owner user ID
    
    Returns:
        True if deleted, False if not found
    """
    run = get_run(db, run_id, user_id)
    
    if not run:
        return False
    
    db.delete(run)
    db.commit()
    
    return True
