from fastapi import APIRouter, Request, Depends, HTTPException
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth # type: ignore
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.db_models import User
from ..db import get_session
from .helpers import (
    create_access_token,
    create_refresh_token,
    redis_client,
    hash_password,
    generateUserId,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    logger
)
from datetime import timedelta

router = APIRouter()

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)

FRONTEND_URL = os.getenv('FRONTEND_URL', '/')


@router.get('/login')
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get('/callback', name='google_callback')
async def google_callback(request: Request, session: AsyncSession = Depends(get_session)):
    try:
        token = await oauth.google.authorize_access_token(request)
        userinfo = await oauth.google.parse_id_token(request, token)
    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        raise HTTPException(status_code=400, detail="Google authentication failed")

    email = userinfo.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="No email returned from Google")

    result = await session.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        import secrets
        pwd = secrets.token_urlsafe(24)
        user = User(
            id=generateUserId(),
            first_name=userinfo.get('given_name'),
            last_name=userinfo.get('family_name'),
            email=email,
            password=hash_password(pwd),
            verified=True,
        )
        session.add(user)
        await session.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    # store refresh token
    try:
        await redis_client.setex(f"refresh:{user.id}", int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()), refresh_token)
    except Exception as e:
        logger.warning(f"Could not store refresh token in Redis: {e}")

    resp = RedirectResponse(url=FRONTEND_URL)
    resp.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='strict', max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    resp.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='strict', max_age=int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()))
    return resp
