import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ["OPENAI_BASE_URL"],
    api_key=os.environ["HF_TOKEN"],
)

def get_embedding(text: str) -> list:
    """
    Generate embedding for the given text using OpenAI.
    """
    try:
        response = client.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )
        return response.data[0].embedding
    except Exception as e:
        raise ValueError(f"Error generating embedding: {str(e)}")

def cosine_similarity(vec1: list, vec2: list) -> float:
    """
    Calculate cosine similarity between two vectors.
    """
    import numpy as np
    a = np.array(vec1)
    b = np.array(vec2)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))