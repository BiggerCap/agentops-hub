"""
Agent Builder - Constructs LlamaIndex agents with tools and RAG

Builds configured agents ready for execution with:
- System prompts
- Selected tools
- Vector retriever (if KB enabled)
"""

from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI
from llama_index.core.tools import FunctionTool
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Agent
from app.ai import tool_registry, vectorstore_qdrant


def build_agent(
    agent: Agent,
    db: Session,
    user_id: int,
) -> ReActAgent:
    """
    Build a LlamaIndex ReAct agent from configuration.
    
    Args:
        agent: Agent model instance
        db: Database session
        user_id: User ID for context
    
    Returns:
        Configured ReActAgent ready for execution
    """
    
    # Initialize LLM
    llm = OpenAI(model="gpt-4o-mini", temperature=0.7)
    
    # Build tools list
    tools = []
    
    for tool_model in agent.tools:
        tool_name = tool_model.name
        
        # Get tool definition
        tool_def = tool_registry.get_tool_definition(tool_name)
        if not tool_def:
            continue
        
        # Create context for tool execution
        def create_tool_fn(name: str):
            """Closure to capture tool name"""
            def tool_fn(**kwargs):
                context = {
                    "user_id": user_id,
                    "agent_id": agent.id,
                    "db": db
                }
                return tool_registry.execute_tool(name, kwargs, context)
            return tool_fn
        
        # Create LlamaIndex FunctionTool
        llama_tool = FunctionTool.from_defaults(
            fn=create_tool_fn(tool_name),
            name=tool_def["name"],
            description=tool_def["description"],
        )
        tools.append(llama_tool)
    
    # Add vector search tool if KB enabled
    if agent.kb_enabled:
        def vector_search_fn(query: str, top_k: int = 5):
            """Vector search wrapper"""
            results = vectorstore_qdrant.search(
                user_id=user_id,
                agent_id=agent.id,
                query=query,
                top_k=top_k
            )
            
            # Format as context string
            context_texts = [r["text"] for r in results]
            return "\n\n---\n\n".join(context_texts)
        
        kb_tool = FunctionTool.from_defaults(
            fn=vector_search_fn,
            name="knowledge_base_search",
            description="Search the knowledge base for relevant information from uploaded documents."
        )
        tools.append(kb_tool)
    
    # Build ReAct agent using the constructor
    react_agent = ReActAgent(
        name=agent.name,
        description=agent.description or "AI Agent",
        tools=tools,
        llm=llm,
        system_prompt=agent.system_prompt,
        verbose=True,  # Enable logging
    )
    
    return react_agent
