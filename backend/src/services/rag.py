from pinecone import Pinecone # type: ignore
import os
from .embedding import get_embedding
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

INDEX_NAME = "code-review-index"

# Create index if it doesn't exist
if INDEX_NAME not in pc.list_indexes().names():
    pc.create_index(
        name=INDEX_NAME,
        dimension=768,
        metric="cosine",
        spec={
            "serverless": {
                "cloud": "aws",
                "region": "us-east-1"
            }
        }
    )

index = pc.Index(INDEX_NAME)

def store_code_embedding(code_id: str, code: str, metadata: dict = None):
    """
    Store code embedding in Pinecone.
    """
    embedding = get_embedding(code)
    if metadata is None:
        metadata = {}
    metadata["code"] = code
    index.upsert([(code_id, embedding, metadata)])

def retrieve_similar_code(query_code: str, top_k: int = 5):
    """
    Retrieve similar code snippets from Pinecone.
    """
    query_embedding = get_embedding(query_code)
    results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
    return results