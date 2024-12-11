from fastapi import APIRouter, HTTPException, Depends, Body, Form, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models import UserCreate, UserInDB, LoginResponse, UserResponse, UserLogin
from ..config import get_settings
from ..database import get_db
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import re
from typing import Annotated
import logging

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Add logging configuration
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_access_token(user_id: str) -> str:
    settings = get_settings()
    expire = datetime.utcnow() + timedelta(days=settings.access_token_expire_days)
    to_encode = {"user_id": str(user_id), "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def validate_password(password: str) -> bool:
    """
    Validate password strength:
    - At least 8 characters long
    - Contains at least one digit
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    """
    if len(password) < 8:
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    return True

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user exists
    if await db.users.find_one({"nickname": user.nickname}):
        raise HTTPException(status_code=400, detail="Nickname already registered")
    
    # Validate password strength
    if not validate_password(user.password):
        raise HTTPException(
            status_code=400, 
            detail="Password must be at least 8 characters long and contain uppercase, lowercase letters and numbers"
        )
    
    # Create user document
    user_dict = user.model_dump(exclude_unset=True)
    user_dict["password"] = get_password_hash(user.password)
    user_dict["created_at"] = datetime.utcnow()
    
    try:
        # Insert into database
        result = await db.users.insert_one(user_dict)
        
        # Get created user
        created_user = await db.users.find_one({"_id": result.inserted_id})
        if not created_user:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Generate token
        token = create_access_token(str(result.inserted_id))
        
        # Return response
        return {
            "id": str(result.inserted_id),
            "nickname": created_user["nickname"],
            "photo_url": created_user.get("photo_url"),
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error")

@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        # Try to get JSON data
        json_data = await request.json()
        nickname = json_data.get("nickname")
        password = json_data.get("password")
        logger.debug(f"Received JSON login attempt for user: {nickname}")
    except:
        # If not JSON, try form data
        form_data = await request.form()
        nickname = form_data.get("nickname")
        password = form_data.get("password")
        logger.debug(f"Received Form login attempt for user: {nickname}")

    if not nickname or not password:
        raise HTTPException(
            status_code=422,
            detail="Nickname and password are required"
        )

    # Find user
    user = await db.users.find_one({"nickname": nickname})
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid nickname or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid nickname or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    token = create_access_token(str(user["_id"]))
    logger.debug(f"Generated token for user {nickname}: {token}")
    
    # Create response
    response = {
        "id": str(user["_id"]),
        "nickname": user["nickname"],
        "photo_url": user.get("photo_url"),
        "token": token
    }
    logger.debug(f"Sending response: {response}")
    
    return response
