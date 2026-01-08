"""
Qdrant Vector Store - Document embedding storage and retrieval

Manages vector embeddings for RAG (Retrieval Augmented Generation).
Ensures user/agent isolation via payload filtering.
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from typing import List, Dict, Any
from app.core.config import settings
from app.ai import openai_client


# Initialize Qdrant client
qdrant = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)

# Collection name for all document embeddings
COLLECTION_NAME = "documents"


def initialize_collection() -> None:
    """
    Create Qdrant collection if it doesn't exist.
    Called on application startup.
    """
    try:
        # Check if collection exists
        collections = qdrant.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        
        if not exists:
            # Create collection with appropriate vector size
            vector_size = openai_client.get_embedding_dimension()
            qdrant.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE  # Cosine similarity for semantic search
                ),
            )
            print(f"✅ Created Qdrant collection '{COLLECTION_NAME}' with dimension {vector_size}")
    
    except Exception as e:
        print(f"⚠️  Qdrant collection initialization warning: {e}")


def add_documents(
    user_id: int,
    agent_id: int,
    doc_id: int,
    chunks: List[str],
    chunk_ids: List[str],
) -> int:
    """
    Add document chunks with embeddings to Qdrant.
    
    Args:
        user_id: User ID for access control
        agent_id: Agent ID for filtering
        doc_id: Document ID for reference
        chunks: List of text chunks
        chunk_ids: Unique IDs for each chunk
    
    Returns:
        Number of chunks successfully added
    
    Raises:
        Exception if embedding or upload fails
    """
    try:
        # Generate embeddings for all chunks
        embeddings = openai_client.get_embeddings(chunks)
        
        # Prepare points for Qdrant
        points = []
        for idx, (chunk_id, chunk_text, embedding) in enumerate(zip(chunk_ids, chunks, embeddings)):
            point = PointStruct(
                id=chunk_id,  # Use chunk_id as point ID
                vector=embedding,
                payload={
                    "user_id": user_id,
                    "agent_id": agent_id,
                    "doc_id": doc_id,
                    "chunk_index": idx,
                    "text": chunk_text,  # Store text for retrieval
                }
            )
            points.append(point)
        
        # Upload to Qdrant
        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        
        return len(points)
    
    except Exception as e:
        raise Exception(f"Failed to add documents to Qdrant: {str(e)}")


def search(
    user_id: int,
    agent_id: int,
    query: str,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Search for relevant document chunks using semantic similarity.
    
    Args:
        user_id: User ID for access control
        agent_id: Agent ID for filtering
        query: Search query text
        top_k: Number of results to return
    
    Returns:
        List of dicts with 'text', 'score', 'doc_id', 'chunk_index'
    """
    try:
        # Generate query embedding
        query_embedding = openai_client.get_embeddings([query])[0]
        
        # Search with user/agent filtering
        results = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            query_filter=Filter(
                must=[
                    FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                    FieldCondition(key="agent_id", match=MatchValue(value=agent_id)),
                ]
            ),
            limit=top_k,
        )
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "text": result.payload.get("text", ""),
                "score": result.score,
                "doc_id": result.payload.get("doc_id"),
                "chunk_index": result.payload.get("chunk_index"),
            })
        
        return formatted_results
    
    except Exception as e:
        raise Exception(f"Qdrant search failed: {str(e)}")


def delete_document(user_id: int, agent_id: int, doc_id: int) -> None:
    """
    Delete all chunks for a specific document.
    
    Args:
        user_id: User ID for access control
        agent_id: Agent ID for filtering
        doc_id: Document ID to delete
    """
    try:
        qdrant.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                    FieldCondition(key="agent_id", match=MatchValue(value=agent_id)),
                    FieldCondition(key="doc_id", match=MatchValue(value=doc_id)),
                ]
            ),
        )
    
    except Exception as e:
        raise Exception(f"Failed to delete document from Qdrant: {str(e)}")


def delete_agent_documents(user_id: int, agent_id: int) -> None:
    """
    Delete all documents for an agent (when agent is deleted).
    
    Args:
        user_id: User ID for access control
        agent_id: Agent ID to delete documents for
    """
    try:
        qdrant.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                    FieldCondition(key="agent_id", match=MatchValue(value=agent_id)),
                ]
            ),
        )
    
    except Exception as e:
        raise Exception(f"Failed to delete agent documents from Qdrant: {str(e)}")
