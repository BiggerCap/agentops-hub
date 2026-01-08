"""
Streaming API - Server-Sent Events for real-time run execution
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.run import Run, RunStatus
import json
import asyncio

router = APIRouter(prefix="/streaming", tags=["Streaming"])


async def stream_run_execution(run_id: int, db: Session, user_id: int):
    """
    Stream run execution progress as Server-Sent Events
    
    Yields:
        SSE-formatted messages with run status updates
    """
    try:
        # Initial check - verify run exists and belongs to user
        run = db.query(Run).filter(Run.id == run_id, Run.user_id == user_id).first()
        if not run:
            yield f"event: error\ndata: {json.dumps({'error': 'Run not found'})}\n\n"
            return
        
        # Send initial status
        yield f"event: status\ndata: {json.dumps({'status': run.status.value, 'message': 'Starting...'})}\\n\\n"
        
        # Poll for updates (max 2 minutes)
        max_polls = 120
        poll_count = 0
        last_status = run.status
        
        while poll_count < max_polls:
            await asyncio.sleep(1)
            poll_count += 1
            
            # Refresh run from database
            db.refresh(run)
            
            # Send status update if changed
            if run.status != last_status:
                yield f"event: status\ndata: {json.dumps({'status': run.status.value, 'message': f'Status: {run.status.value}'})}\\n\\n"
                last_status = run.status
            
            # If completed or failed, send final message and stop
            if run.status == RunStatus.COMPLETED:
                yield f"event: complete\ndata: {json.dumps({'output': run.output_text})}\\n\\n"
                break
            elif run.status == RunStatus.FAILED:
                yield f"event: error\ndata: {json.dumps({'error': run.error_message})}\\n\\n"
                break
            
            # Send heartbeat
            if poll_count % 10 == 0:
                yield f"event: heartbeat\ndata: {json.dumps({'poll_count': poll_count})}\\n\\n"
        
        # Timeout
        if poll_count >= max_polls:
            yield f"event: timeout\ndata: {json.dumps({'message': 'Run execution timeout'})}\\n\\n"
    
    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e)})}\\n\\n"


@router.get("/runs/{run_id}/stream")
async def stream_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Stream run execution progress in real-time using Server-Sent Events
    
    Returns:
        StreamingResponse with SSE format
        
    Events:
    - status: Status updates
    - complete: Run completed with output
    - error: Error occurred
    - heartbeat: Keep-alive signal
    - timeout: Execution timeout
    """
    return StreamingResponse(
        stream_run_execution(run_id, db, current_user.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )
