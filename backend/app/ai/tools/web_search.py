"""
Web Search Tool - Search the internet using DuckDuckGo
"""

from llama_index.core.tools import FunctionTool
from duckduckgo_search import DDGS
from typing import List


def web_search(query: str, max_results: int = 5) -> str:
    """
    Search the web for current information using DuckDuckGo
    
    Args:
        query: Search query string
        max_results: Maximum number of results to return (default 5)
        
    Returns:
        Formatted search results as a string
    """
    try:
        ddgs = DDGS()
        results = list(ddgs.text(query, max_results=max_results))
        
        if not results:
            return f"No results found for: {query}"
        
        # Format results
        formatted_results = [f"Web search results for: {query}\n"]
        for i, result in enumerate(results, 1):
            title = result.get('title', 'No title')
            body = result.get('body', 'No description')
            link = result.get('link', 'No link')
            formatted_results.append(f"{i}. {title}\n   {body}\n   Source: {link}\n")
        
        return "\n".join(formatted_results)
        
    except Exception as e:
        return f"Web search failed: {str(e)}"


# Create LlamaIndex tool
web_search_tool = FunctionTool.from_defaults(
    fn=web_search,
    name="web_search",
    description="""Search the internet for current information, news, facts, or any topic.
    Use this when you need up-to-date information that may not be in your knowledge base.
    Provide a clear, specific search query."""
)
