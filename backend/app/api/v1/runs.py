"""
Runs API Router - REST endpoints for agent execution

Endpoints:
- POST /runs - Create and execute a run
- GET /runs - List runs
- GET /runs/{id} - Get run details with steps
- DELETE /runs/{id} - Delete run
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.run import RunCreate, RunRead, RunWithSteps, RunList
from app.services import run_service


router = APIRouter(prefix="/runs", tags=["runs"])


@router.post("", response_model=RunRead, status_code=status.HTTP_201_CREATED)
async def create_run(
    run_data: RunCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create and execute a run.
    
    Args:
        run_data: Run creation data (agent_id, input_text)
        background_tasks: FastAPI background tasks
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Created run (status will be PENDING initially)
    """
    try:
        # Create run
        run = run_service.create_run(
            db=db,
            run_data=run_data,
            user_id=current_user.id,
        )
        
        # Execute in background
        background_tasks.add_task(
            run_service.start_run_execution,
            run_id=run.id,
            db=db,
        )
        
        return run
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("", response_model=RunList)
def list_runs(
    agent_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all runs for the current user.
    
    Args:
        agent_id: Optional agent ID to filter by
        skip: Number of records to skip (pagination)
        limit: Maximum records to return
        db: Database session
        current_user: Authenticated user
    
    Returns:
        List of runs
    """
    runs = run_service.get_runs(
        db=db,
        user_id=current_user.id,
        agent_id=agent_id,
        skip=skip,
        limit=limit,
    )
    
    return RunList(runs=runs, total=len(runs))


@router.get("/{run_id}", response_model=RunWithSteps)
def get_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single run by ID with all execution steps.
    
    This is the CRITICAL endpoint for interviews - it shows
    the complete execution timeline with every LLM call,
    tool invocation, and result.
    
    Args:
        run_id: Run ID
        db: Database session
        current_user: Authenticated user
    
    Returns:
        Run with full step details (the timeline view)
    """
    run = run_service.get_run(
        db=db,
        run_id=run_id,
        user_id=current_user.id,
    )
    
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found",
        )
    
    return run


@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a run (cascades to steps).
    
    Args:
        run_id: Run ID
        db: Database session
        current_user: Authenticated user
    
    Returns:
        No content
    """
    deleted = run_service.delete_run(
        db=db,
        run_id=run_id,
        user_id=current_user.id,
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found",
        )
