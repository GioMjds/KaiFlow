from sentence_transformers import SentenceTransformer
import numpy as np

# Load a pre-trained model for code embeddings
model = SentenceTransformer('microsoft/DialoGPT-medium')  # Must be a model that supports code embeddings

def get_embedding(text: str) -> list:
    """
    Generate embedding for the given text.
    """
    embedding = model.encode(text)
    return embedding.tolist()

def cosine_similarity(vec1: list, vec2: list) -> float:
    """
    Calculate cosine similarity between two vectors.
    """
    a = np.array(vec1)
    b = np.array(vec2)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))