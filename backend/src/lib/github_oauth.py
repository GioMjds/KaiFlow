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
    name='github',
    client_id=os.getenv('GITHUB_CLIENT_ID'),
    client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

FRONTEND_URL = os.getenv('FRONTEND_URL', '/')


@router.get('/login')
async def github_login(request: Request):
    redirect_uri = request.url_for('github_callback')
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get('/callback', name='github_callback')
async def github_callback(request: Request, session: AsyncSession = Depends(get_session)):
    try:
        token = await oauth.github.authorize_access_token(request)
        # fetch user info
        resp = await oauth.github.get('user', token=token)
        profile = resp.json()
    except Exception as e:
        logger.error(f"GitHub OAuth error: {e}")
        raise HTTPException(status_code=400, detail="GitHub authentication failed")

    # Determine email: sometimes not present in user profile, fetch emails
    email = profile.get('email')
    if not email:
        try:
            emails_resp = await oauth.github.get('user/emails', token=token)
            emails = emails_resp.json()
            primary = next((e for e in emails if e.get('primary') and e.get('verified')), None)
            if primary:
                email = primary.get('email')
            elif emails:
                email = emails[0].get('email')
        except Exception:
            email = None

    if not email:
        raise HTTPException(status_code=400, detail="No email available from GitHub")

    result = await session.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        import secrets
        pwd = secrets.token_urlsafe(24)
        user = User(
            id=generateUserId(),
            first_name=profile.get('name'),
            last_name=None,
            email=email,
            password=hash_password(pwd),
            verified=True,
        )
        session.add(user)
        await session.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    try:
        await redis_client.setex(f"refresh:{user.id}", int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()), refresh_token)
    except Exception as e:
        logger.warning(f"Could not store refresh token in Redis: {e}")

    resp = RedirectResponse(url=FRONTEND_URL)
    resp.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='strict', max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    resp.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='strict', max_age=int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()))
    return resp
