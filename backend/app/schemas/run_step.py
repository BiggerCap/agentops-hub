"""
RunStep Schemas - Response models for execution logs

CRITICAL FOR INTERVIEW: Exposes the detailed execution timeline.

These schemas structure the step-by-step logs that show:
- What the LLM decided
- Which tools were called
- What results came back
- Any errors that occurred
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, List, Dict
from datetime import datetime
from app.models.run_step import StepType


class RunStepRead(BaseModel):
    """Schema for run step API responses"""
    id: int
    run_id: int
    step_order: int
    step_type: StepType
    input_data: Optional[Dict[str, Any]] = Field(None, description="Step input (e.g., LLM prompt, tool args)")
    output_data: Optional[Dict[str, Any]] = Field(None, description="Step output (e.g., LLM response, tool result)")
    tool_name: Optional[str] = Field(None, description="Tool name if step_type is tool_call/tool_result")
    error_message: Optional[str]
    timestamp: datetime
    duration_ms: Optional[int] = Field(None, description="Execution duration in milliseconds")
    
    class Config:
        from_attributes = True


class RunStepList(BaseModel):
    """Schema for run step timeline responses"""
    steps: List[RunStepRead]
    total: int


from typing import List
RunStepList.model_rebuild()
