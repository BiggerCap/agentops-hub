"""
OpenAI Client - Wrapper for OpenAI API calls

Provides clean interfaces for:
- Chat completions (agent reasoning)
- Embeddings (document vectorization)
- Token counting (cost estimation)
"""

from openai import OpenAI
from typing import List, Dict, Any, Optional
import tiktoken
from app.core.config import settings


# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


def get_chat_completion(
    messages: List[Dict[str, str]],
    model: str = "gpt-4o-mini",
    tools: Optional[List[Dict[str, Any]]] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Get chat completion from OpenAI.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        model: OpenAI model to use
        tools: Optional list of tool definitions for function calling
        temperature: Randomness (0-2, lower is more deterministic)
        max_tokens: Maximum tokens in response
    
    Returns:
        Dict with 'content' (str) and optionally 'tool_calls' (list)
    
    Raises:
        OpenAI API errors (propagated for caller to handle)
    """
    try:
        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"
        
        if max_tokens:
            kwargs["max_tokens"] = max_tokens
        
        response = client.chat.completions.create(**kwargs)
        message = response.choices[0].message
        
        result = {
            "content": message.content or "",
            "model": response.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
        }
        
        # Include tool calls if present
        if message.tool_calls:
            result["tool_calls"] = [
                {
                    "id": tc.id,
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in message.tool_calls
            ]
        
        return result
    
    except Exception as e:
        raise Exception(f"OpenAI chat completion failed: {str(e)}")


def get_embeddings(
    texts: List[str],
    model: str = "text-embedding-3-small",
) -> List[List[float]]:
    """
    Generate embeddings for text chunks.
    
    Args:
        texts: List of text strings to embed
        model: OpenAI embedding model
    
    Returns:
        List of embedding vectors (each is a list of floats)
    
    Raises:
        OpenAI API errors
    """
    try:
        # OpenAI has a batch limit, process in chunks if needed
        batch_size = 100
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            response = client.embeddings.create(
                model=model,
                input=batch
            )
            embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(embeddings)
        
        return all_embeddings
    
    except Exception as e:
        raise Exception(f"OpenAI embeddings failed: {str(e)}")


def count_tokens(text: str, model: str = "gpt-4") -> int:
    """
    Count tokens in text for cost estimation.
    
    Args:
        text: Text to count
        model: Model name (affects tokenizer)
    
    Returns:
        Number of tokens
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))
    except Exception:
        # Fallback: rough estimation (1 token ≈ 4 characters)
        return len(text) // 4


def get_embedding_dimension(model: str = "text-embedding-3-small") -> int:
    """
    Get vector dimension for embedding model.
    
    Returns:
        Dimension size (e.g., 1536 for ada-002, 384 for 3-small)
    """
    dimensions = {
        "text-embedding-3-small": 1536,
        "text-embedding-3-large": 3072,
        "text-embedding-ada-002": 1536,
    }
    return dimensions.get(model, 1536)
