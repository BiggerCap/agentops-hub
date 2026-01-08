"""
Database Seeding Script

Seeds the database with initial data:
- 5 pre-defined tools from tool_registry (including web_search)
"""

from app.db.session import SessionLocal
from app.models.tool import Tool


def seed_tools():
    """Seed the Tool table with pre-defined tools."""
    
    db = SessionLocal()
    
    try:
        # Check if tools already exist
        existing = db.query(Tool).count()
        
        if existing > 0:
            print(f"✓ Tools already seeded ({existing} tools exist)")
            return
        
        # Define tools
        tools = [
            {
                "name": "vector_search",
                "description": "Search the agent's knowledge base using vector similarity",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        },
                        "top_k": {
                            "type": "integer",
                            "description": "Number of results to return",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "sql_query",
                "description": "Execute a SQL SELECT query against the database",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "SQL SELECT query to execute"
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "http_fetch",
                "description": "Fetch data from an external HTTP API",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "URL to fetch"
                        },
                        "method": {
                            "type": "string",
                            "description": "HTTP method (GET or POST)",
                            "enum": ["GET", "POST"],
                            "default": "GET"
                        },
                        "body": {
                            "type": "object",
                            "description": "Request body (for POST)"
                        }
                    },
                    "required": ["url"]
                }
            },
            {
                "name": "file_fetch",
                "description": "Read content from an uploaded document",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "doc_id": {
                            "type": "integer",
                            "description": "Document ID to read"
                        }
                    },
                    "required": ["doc_id"]
                }
            },
            {
                "name": "web_search",
                "description": "Search the web using DuckDuckGo to find current information",
                "config_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum number of results to return",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }
            }
        ]
        
        # Create tools
        for tool_data in tools:
            tool = Tool(**tool_data)
            db.add(tool)
        
        db.commit()
        
        print(f"✓ Seeded {len(tools)} tools")
    
    except Exception as e:
        print(f"✗ Error seeding tools: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding database...")
    seed_tools()
    print("Done!")
