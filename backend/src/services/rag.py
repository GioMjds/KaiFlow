from pinecone import Pinecone # type: ignore
import os
from .embedding import get_embedding
from dotenv import load_dotenv
from ..db import AsyncSessionLocal
from ..models.db_models import Message, Conversation

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

INDEX_NAME = "code-review-index"

# Create index if it doesn't exist or has wrong dimension
if INDEX_NAME in pc.list_indexes().names():
    index_info = pc.describe_index(INDEX_NAME)
    if index_info.dimension != 1536:
        pc.delete_index(INDEX_NAME)
        pc.create_index(
            name=INDEX_NAME,
            dimension=1536,
            metric="cosine",
            spec={
                "serverless": {
                    "cloud": "aws",
                    "region": "us-east-1"
                }
            }
        )
else:
    pc.create_index(
        name=INDEX_NAME,
        dimension=1536,
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


async def store_message_with_embedding(
    text: str, 
    conversation_id: int | None = None, 
    user_id: int | None = None, 
    role: str = "user"
) -> tuple[int, str]:
    """
    Create a Message row (and Conversation if needed), generate an embedding,
    upsert it to Pinecone using id "msg:<id>", and update the Message.pinecone_id.

    Returns: (message_id, pinecone_id)
    """
    async with AsyncSessionLocal() as session:
        if conversation_id is None:
            conv = Conversation(user_id=user_id, title=None)
            session.add(conv)
            await session.commit()
            await session.refresh(conv)
            conversation_id = conv.id

        msg = Message(conversation_id=conversation_id, user_id=user_id, role=role, text=text)
        session.add(msg)
        await session.commit()
        await session.refresh(msg)

    # generate embedding (sync call may block briefly)
    embedding = get_embedding(text)
    pine_id = f"msg:{msg.id}"
    metadata = {"message_id": msg.id, "conversation_id": conversation_id, "user_id": user_id, "text": text}
    index.upsert([(pine_id, embedding, metadata)])

    # update message with pinecone id
    async with AsyncSessionLocal() as session:
        db_msg = await session.get(Message, msg.id)
        db_msg.pinecone_id = pine_id
        session.add(db_msg)
        await session.commit()

    return msg.id, pine_id

def retrieve_similar_code(query_code: str, top_k: int = 5):
    """
    Retrieve similar code snippets from Pinecone.
    """
    query_embedding = get_embedding(query_code)
    results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
    return results