from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.review import review
from .api.auth import auth
import uvicorn
import os
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()

api = FastAPI(
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv('SESSION_SECRET', os.getenv('JWT_SECRET_KEY'))
)

api.include_router(review)
api.include_router(auth)

app.mount("/api", api)

if __name__ == "__main__":
    uvicorn.run("src.app:app")