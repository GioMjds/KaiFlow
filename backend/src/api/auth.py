from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.db_models import User
from ..db import get_session
from ..lib.helpers import (
    SignupRequest,
    LoginRequest,
    VerifyRequest,
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_otp,
    generateUserId,
    send_otp_email,
    redis_client,
    rate_limit,
    logger,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS
)
from datetime import timedelta

auth = APIRouter(prefix='/auth')

# include social oauth routers if available
try:
    from ..lib.google_oauth import router as google_router
    auth.include_router(google_router, prefix='/google')
except Exception:
    logger = None

try:
    from ..lib.github_oauth import router as github_router
    auth.include_router(github_router, prefix='/github')
except Exception:
    logger = None

@auth.post('/signup')
async def signup(request: SignupRequest, session: AsyncSession = Depends(get_session)):
    try:
        rate_key = f"signup:{request.email}"
        if not await rate_limit(rate_key, 5, 3600):
            logger.warning(f"Signup rate limit exceeded for email: {request.email}")
            return JSONResponse(status_code=429, content={"error": "Too many signup attempts. Try again later."})

        if request.password != request.confirm_password:
            logger.warning(f"Password mismatch for email: {request.email}")
            return JSONResponse(status_code=400, content={"error": "Passwords do not match"})
        if not validate_password_strength(request.password):
            logger.warning(f"Weak password for email: {request.email}")
            return JSONResponse(status_code=400, content={"error": "Password must be at least 8 characters with uppercase, lowercase, digit, and special character"})

        result = await session.execute(select(User).where(User.email == request.email))
        existing_user = result.scalars().first()
        if existing_user:
            logger.warning(f"Signup attempt for existing email: {request.email}")
            return JSONResponse(status_code=400, content={"error": "User already exists"})

        hashed_password = hash_password(request.password)
        new_user = User(
            id=generateUserId(),
            first_name=request.first_name,
            last_name=request.last_name,
            email=request.email,
            password=hashed_password,
            verified=False,
        )
        session.add(new_user)
        await session.commit()

        otp = generate_otp()
        await redis_client.setex(f"otp:{request.email}", 600, otp)
        await send_otp_email(request.email, otp)

        logger.info(f"User signed up: {request.email}")
        return JSONResponse(
            content={"message": "Signup successful. Please verify your email."}, 
            status_code=200
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

@auth.post('/login')
async def login(request: LoginRequest, response: Response, req: Request, session: AsyncSession = Depends(get_session)):
    rate_key = f"login:{request.email}"
    if not await rate_limit(rate_key, 5, 900):
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")
    
    result = await session.execute(select(User).where(User.email == request.email))
    
    user = result.scalars().first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token in Redis
    await redis_client.setex(f"refresh:{user.id}", int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()), refresh_token)

    cookie_secure = req.url.scheme == "https"
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=cookie_secure,
        samesite="strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=cookie_secure,
        samesite="strict",
        max_age=int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds())
    )
    
    return JSONResponse(content={"message": "Login successful"}, status_code=200)

@auth.post('/verify')
async def verify_otp(request: VerifyRequest, session: AsyncSession = Depends(get_session)):
    # Rate limit OTP attempts by email (3 per 5 minutes)
    rate_key = f"otp:{request.email}"
    if not await rate_limit(rate_key, 3, 300):
        logger.warning(f"OTP rate limit exceeded for email: {request.email}")
        raise HTTPException(status_code=429, detail="Too many OTP attempts. Try again later.")
    
    stored_otp = await redis_client.get(f"otp:{request.email}")
    if not stored_otp or stored_otp.decode() != request.otp:
        logger.warning(f"Invalid OTP for email: {request.email}")
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    result = await session.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    if not user:
        logger.warning(f"OTP verification for non-existent user: {request.email}")
        raise HTTPException(status_code=404, detail="User not found")
    
    user.verified = True
    await session.commit()
    await redis_client.delete(f"otp:{request.email}")
    
    logger.info(f"User verified email: {request.email}")
    return JSONResponse(content={"message": "Email verified successfully"}, status_code=200)

@auth.post('/logout')
async def logout(request: Request, response: Response):
    access_token = request.cookies.get("access_token")
    user_id = None
    if access_token:
        payload = verify_token(access_token)
        if payload:
            user_id = payload.get("sub")
            await redis_client.delete(f"refresh:{user_id}")
    
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    
    logger.info(f"User logged out: {user_id}")
    return JSONResponse(content={"message": "Logged out successfully"}, status_code=200)

@auth.post('/refresh')
async def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        logger.warning("Refresh attempt without token")
        raise HTTPException(status_code=401, detail="No refresh token")
    
    payload = verify_token(refresh_token)
    if not payload:
        logger.warning("Invalid refresh token")
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    
    # Check if stored refresh token matches
    stored_refresh = await redis_client.get(f"refresh:{user_id}")
    if not stored_refresh or stored_refresh.decode() != refresh_token:
        logger.warning(f"Refresh token mismatch for user: {user_id}")
        raise HTTPException(status_code=401, detail="Refresh token revoked")
    
    # Generate new access token
    new_access_token = create_access_token(data={"sub": user_id})

    cookie_secure = request.url.scheme == "https"
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=cookie_secure,
        samesite="strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    logger.info(f"Token refreshed for user: {user_id}")
    return JSONResponse(content={"message": "Token refreshed"}, status_code=200)