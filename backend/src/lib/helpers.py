from dotenv import load_dotenv
load_dotenv()

import redis.asyncio as redis
from jose import jwt
from passlib.context import CryptContext
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
import random
import string
import logging
import re
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30

REDIS_URL = os.getenv("REDIS_URL")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Redis client
redis_client = redis.from_url(REDIS_URL)

# Pydantic models
class SignupRequest(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
class VerifyRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

# Helpers
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password: str) -> bool:
    """Check if password meets minimum requirements: 8+ chars, upper, lower, digit, special"""
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    return True

async def rate_limit(key: str, limit: int, window_seconds: int) -> bool:
    """Rate limiting using Redis. Returns True if allowed, False if exceeded."""
    try:
        current = await redis_client.incr(key)
        if current == 1:
            await redis_client.expire(key, window_seconds)
        if current > limit:
            logger.warning(f"Rate limit exceeded for key: {key}")
            return False
        return True
    except Exception as e:
        logger.error(f"Redis error in rate_limit: {e}. Allowing request.")
        return True  # Allow if Redis fails

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.JWTError:
        return None

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def generateUserId(length: int = 8) -> str:
    """Generate a short human-friendly ID of configurable length (default 8)."""
    alphabet: str = string.ascii_letters + string.digits
    short_id: str = ''.join(random.choices(alphabet, k=length))
    return short_id

async def send_otp_email(email: str, otp: str):
    message = Mail(
        from_email=SENDGRID_FROM_EMAIL,
        to_emails=email,
        subject='Your OTP Code',
        html_content=f'<p>Your OTP code is: <strong>{otp}</strong></p>'
    )
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    try:
        # SendGrid client is synchronous; run in thread to avoid blocking the event loop
        from anyio import to_thread
        resp = await to_thread.run_sync(lambda: sg.send(message))
        # resp has status_code and body
        status = getattr(resp, "status_code", None) or getattr(resp, "status", None)
        if status and int(status) >= 400:
            logger.error(f"SendGrid send failed: status={status} body={getattr(resp,'body',None)}")
            raise Exception(f"SendGrid error: {status}")
        logger.info(f"OTP email sent to {email}, status={status}")
    except Exception as e:
        logger.error(f"SendGrid error when sending OTP to {email}: {e}")
        raise