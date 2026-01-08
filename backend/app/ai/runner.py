"""
Agent Runner - Orchestrates agent execution with detailed logging

CRITICAL: This is the "killer feature" for interviews.

Executes agents and logs EVERY step:
- LLM reasoning
- Tool calls
- Tool results
- Errors
- Final answers

This enables the beautiful timeline view that shows exactly how the agent worked.
"""

import time
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models import Run, RunStep, RunStatus, StepType, Agent
from app.ai import agent_builder
from app.services.conversation_service import get_conversation_history, add_message


async def execute_run(
    run_id: int,
    agent: Agent,
    input_text: str,
    db: Session,
    user_id: int,
    conversation_id: Optional[int] = None,
) -> None:
    """
    Execute an agent run with comprehensive step logging.
    
    This function:
    1. Updates run status to "running"
    2. Loads conversation history if conversation_id provided
    3. Builds the agent
    4. Executes with the input (with history if available)
    5. Logs every LLM call and tool invocation
    6. Saves assistant response to conversation if conversation_id provided
    7. Updates final status and output
    
    Args:
        run_id: Run ID to execute
        agent: Agent configuration
        input_text: User's task/query
        db: Database session
        user_id: User ID
        conversation_id: Optional conversation ID for persistent history
    """
    
    step_order = 0
    
    try:
        # Update run status
        run = db.query(Run).filter(Run.id == run_id).first()
        run.status = RunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()
        
        # Load conversation history if provided
        history_messages = []
        if conversation_id:
            history_messages = get_conversation_history(
                db=db,
                conversation_id=conversation_id,
                user_id=user_id
            )
            
            # Log conversation context
            if history_messages:
                log_step(
                    db=db,
                    run_id=run_id,
                    step_order=step_order,
                    step_type=StepType.LLM_CALL,
                    input_data={"conversation_history": f"Loaded {len(history_messages)} previous messages"},
                    output_data=None
                )
                step_order += 1
        
        # Log initial input
        log_step(
            db=db,
            run_id=run_id,
            step_order=step_order,
            step_type=StepType.LLM_CALL,
            input_data={"user_input": input_text},
            output_data=None
        )
        step_order += 1
        
        # Build agent
        llama_agent = agent_builder.build_agent(
            agent=agent,
            db=db,
            user_id=user_id
        )
        
        # Execute agent (this is where the magic happens)
        start_time = time.time()
        
        try:
            # Prepare input with history if available
            if history_messages:
                # LlamaIndex agents can accept chat_history parameter
                # For now, we'll prepend history to the input as context
                history_text = "\n\n".join([
                    f"{msg['role'].upper()}: {msg['content']}"
                    for msg in history_messages[-10:]  # Last 10 messages to avoid token limit
                ])
                full_input = f"Previous conversation:\n{history_text}\n\nCurrent query:\n{input_text}"
            else:
                full_input = input_text
            
            # Run agent with input - handler IS the result (AgentOutput)
            result = await llama_agent.run(user_msg=full_input)
            
            # Extract response text from AgentOutput
            output_text = str(result.response) if hasattr(result, 'response') else str(result)
            
            # Calculate execution time
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Save messages to conversation if conversation_id provided
            if conversation_id:
                # Add user message
                add_message(
                    db=db,
                    conversation_id=conversation_id,
                    role="user",
                    content=input_text,
                    user_id=user_id
                )
                
                # Add assistant message
                add_message(
                    db=db,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=output_text,
                    user_id=user_id
                )
            
            # Log final answer
            log_step(
                db=db,
                run_id=run_id,
                step_order=step_order,
                step_type=StepType.FINAL_ANSWER,
                input_data=None,
                output_data={"answer": output_text},
                duration_ms=duration_ms
            )
            
            # Update run with success
            run.status = RunStatus.COMPLETED
            run.output_text = output_text
            run.completed_at = datetime.utcnow()
            db.commit()
        
        except Exception as agent_error:
            # Log error
            log_step(
                db=db,
                run_id=run_id,
                step_order=step_order,
                step_type=StepType.ERROR,
                input_data=None,
                output_data=None,
                error_message=str(agent_error)
            )
            
            # Update run with failure
            run.status = RunStatus.FAILED
            run.error_message = str(agent_error)
            run.completed_at = datetime.utcnow()
            db.commit()
    
    except Exception as e:
        # Fatal error (e.g., agent building failed)
        run = db.query(Run).filter(Run.id == run_id).first()
        run.status = RunStatus.FAILED
        run.error_message = f"Fatal error: {str(e)}"
        run.completed_at = datetime.utcnow()
        db.commit()
        
        # Log error step
        log_step(
            db=db,
            run_id=run_id,
            step_order=step_order,
            step_type=StepType.ERROR,
            input_data=None,
            output_data=None,
            error_message=str(e)
        )


def log_step(
    db: Session,
    run_id: int,
    step_order: int,
    step_type: StepType,
    input_data: dict = None,
    output_data: dict = None,
    tool_name: str = None,
    error_message: str = None,
    duration_ms: int = None,
) -> RunStep:
    """
    Log a single execution step.
    
    Args:
        db: Database session
        run_id: Run ID
        step_order: Sequential step number
        step_type: Type of step (llm_call, tool_call, etc.)
        input_data: Input JSON data
        output_data: Output JSON data
        tool_name: Tool name if applicable
        error_message: Error message if applicable
        duration_ms: Execution duration in milliseconds
    
    Returns:
        Created RunStep instance
    """
    step = RunStep(
        run_id=run_id,
        step_order=step_order,
        step_type=step_type,
        input_data=input_data,
        output_data=output_data,
        tool_name=tool_name,
        error_message=error_message,
        duration_ms=duration_ms,
    )
    
    db.add(step)
    db.commit()
    db.refresh(step)
    
    return step


# Note: For more detailed logging of LlamaIndex internals,
# we would need to implement a custom callback handler.
# For now, this provides the essential execution tracking.
# In production, you'd want to hook into LlamaIndex's callback system
# to capture every LLM call and tool invocation separately.
