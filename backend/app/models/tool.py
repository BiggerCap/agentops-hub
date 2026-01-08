"""
Tool Model - Defines available tools for agents

Tools are capabilities agents can use:
- vector_search: Search knowledge base
- sql_query: Execute SQL queries
- http_fetch: Make HTTP requests
- file_fetch: Retrieve file contents
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.agent import agent_tools


class Tool(Base):
    """
    Tool definition model
    
    Represents a capability (function) that an agent can use during execution
    """
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    
    # JSON schema for tool parameters (for validation)
    config_schema = Column(JSON, nullable=True)
    
    # Relationships
    agents = relationship("Agent", secondary=agent_tools, back_populates="tools")
    
    def __repr__(self):
        return f"<Tool(id={self.id}, name='{self.name}', enabled={self.enabled})>"
