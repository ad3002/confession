from fastapi import Request, HTTPException
import jwt
from .models import UserInDB
from .config import get_settings
from .database import get_db

async def get_current_user(request: Request) -> UserInDB:
    settings = get_settings()
    db = get_db()
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user = await db.users.find_one({"_id": payload["user_id"]})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return UserInDB(**user)
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
