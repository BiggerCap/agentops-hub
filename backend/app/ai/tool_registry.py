"""
Tool Registry - Defines agent capabilities

Implements 4 core tools:
1. vector_search: Search knowledge base (RAG)
2. sql_query: Execute safe SQL queries
3. http_fetch: Make HTTP requests
4. file_fetch: Retrieve document contents

Each tool has a definition (for LLM) and a handler (Python function).
"""

from typing import Dict, Any, List, Callable
from sqlalchemy.orm import Session
import httpx
import json
from app.ai import vectorstore_qdrant
from app.core.config import settings
from app.ai.tools.web_search import web_search


# Tool definitions for LLM function calling
TOOL_DEFINITIONS = {
    "vector_search": {
        "name": "vector_search",
        "description": "Search the knowledge base for relevant information using semantic similarity. Use this when you need to find specific facts or context from uploaded documents.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query to find relevant information"
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of results to return (default: 5)",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    },
    
    "sql_query": {
        "name": "sql_query",
        "description": "Execute a read-only SQL query on the PostgreSQL database. Only SELECT statements are allowed. Use this to retrieve structured data.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The SQL SELECT query to execute"
                }
            },
            "required": ["query"]
        }
    },
    
    "http_fetch": {
        "name": "http_fetch",
        "description": "Make an HTTP request to an external API or URL. Returns the response data. Use this to fetch real-time data or interact with external services.",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The URL to fetch"
                },
                "method": {
                    "type": "string",
                    "description": "HTTP method (GET or POST)",
                    "enum": ["GET", "POST"],
                    "default": "GET"
                },
                "headers": {
                    "type": "object",
                    "description": "Optional HTTP headers as key-value pairs"
                },
                "body": {
                    "type": "string",
                    "description": "Optional request body for POST requests (JSON string)"
                }
            },
            "required": ["url"]
        }
    },
    
    "file_fetch": {
        "name": "file_fetch",
        "description": "Retrieve the full contents of an uploaded document by its ID. Use this to access complete document text.",
        "parameters": {
            "type": "object",
            "properties": {
                "doc_id": {
                    "type": "integer",
                    "description": "The document ID to retrieve"
                }
            },
            "required": ["doc_id"]
        }
    },
    
    "web_search": {
        "name": "web_search",
        "description": "Search the internet for current information, news, facts, or any topic. Use this when you need up-to-date information that may not be in your knowledge base.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query"
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of results (default: 5)",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    }
}


# Tool handlers (actual Python implementations)

def vector_search_handler(
    user_id: int,
    agent_id: int,
    query: str,
    top_k: int = 5,
    **kwargs
) -> Dict[str, Any]:
    """
    Search vector database for relevant chunks.
    
    Returns:
        Dict with 'results' (list of relevant text chunks) and 'count'
    """
    try:
        results = vectorstore_qdrant.search(
            user_id=user_id,
            agent_id=agent_id,
            query=query,
            top_k=top_k
        )
        
        return {
            "results": [
                {
                    "text": r["text"],
                    "relevance_score": round(r["score"], 3)
                }
                for r in results
            ],
            "count": len(results)
        }
    
    except Exception as e:
        return {"error": f"Vector search failed: {str(e)}"}


def sql_query_handler(
    db: Session,
    query: str,
    **kwargs
) -> Dict[str, Any]:
    """
    Execute read-only SQL query (SELECT only).
    
    Returns:
        Dict with 'rows' (list of dicts) and 'count'
    """
    try:
        # Security: Only allow SELECT queries
        query_lower = query.strip().lower()
        if not query_lower.startswith("select"):
            return {"error": "Only SELECT queries are allowed"}
        
        # Check for dangerous keywords
        dangerous = ["insert", "update", "delete", "drop", "alter", "create", "truncate"]
        if any(keyword in query_lower for keyword in dangerous):
            return {"error": "Query contains forbidden keywords"}
        
        # Execute query
        result = db.execute(query)
        rows = [dict(row) for row in result.mappings()]
        
        return {
            "rows": rows,
            "count": len(rows)
        }
    
    except Exception as e:
        return {"error": f"SQL query failed: {str(e)}"}


def http_fetch_handler(
    url: str,
    method: str = "GET",
    headers: Dict[str, str] = None,
    body: str = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Make HTTP request to external API.
    
    Returns:
        Dict with 'status_code', 'data', and optionally 'error'
    """
    try:
        # Timeout to prevent hanging
        timeout = httpx.Timeout(10.0)
        
        with httpx.Client(timeout=timeout) as client:
            if method.upper() == "GET":
                response = client.get(url, headers=headers)
            elif method.upper() == "POST":
                response = client.post(url, headers=headers, content=body)
            else:
                return {"error": f"Unsupported method: {method}"}
            
            # Try to parse JSON response
            try:
                data = response.json()
            except:
                data = response.text
            
            return {
                "status_code": response.status_code,
                "data": data
            }
    
    except Exception as e:
        return {"error": f"HTTP request failed: {str(e)}"}


def file_fetch_handler(
    db: Session,
    user_id: int,
    doc_id: int,
    **kwargs
) -> Dict[str, Any]:
    """
    Retrieve document content from storage.
    
    Returns:
        Dict with 'filename', 'content', and metadata
    """
    try:
        from app.models import Document
        import os
        
        # Get document metadata
        doc = db.query(Document).filter(
            Document.id == doc_id,
            Document.user_id == user_id
        ).first()
        
        if not doc:
            return {"error": "Document not found or access denied"}
        
        # Read file content
        if not os.path.exists(doc.file_path):
            return {"error": "File not found on disk"}
        
        with open(doc.file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {
            "filename": doc.filename,
            "content": content,
            "size_bytes": doc.file_size,
            "processed": doc.processed
        }
    
    except Exception as e:
        return {"error": f"File fetch failed: {str(e)}"}


def web_search_handler(
    query: str,
    max_results: int = 5,
    **kwargs
) -> Dict[str, Any]:
    """
    Search the web for current information.
    
    Returns:
        Dict with 'results' (formatted search results)
    """
    try:
        result = web_search(query, max_results)
        return {"results": result}
    
    except Exception as e:
        return {"error": f"Web search failed: {str(e)}"}


# Registry mapping tool names to handlers
TOOL_HANDLERS: Dict[str, Callable] = {
    "vector_search": vector_search_handler,
    "sql_query": sql_query_handler,
    "http_fetch": http_fetch_handler,
    "file_fetch": file_fetch_handler,
    "web_search": web_search_handler,
}


def get_tool_definition(tool_name: str) -> Dict[str, Any]:
    """Get OpenAI function definition for a tool"""
    return TOOL_DEFINITIONS.get(tool_name)


def execute_tool(
    tool_name: str,
    arguments: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Execute a tool with given arguments.
    
    Args:
        tool_name: Name of tool to execute
        arguments: Tool arguments from LLM
        context: Additional context (user_id, agent_id, db, etc.)
    
    Returns:
        Tool execution result
    """
    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        return {"error": f"Unknown tool: {tool_name}"}
    
    try:
        # Merge arguments with context
        kwargs = {**arguments, **context}
        result = handler(**kwargs)
        return result
    
    except Exception as e:
        return {"error": f"Tool execution failed: {str(e)}"}
