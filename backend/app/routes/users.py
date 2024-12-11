from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from ..models import UserInDB
from ..database import get_db
from ..dependencies import get_current_user
import os
import aiofiles
from datetime import datetime
from bson import ObjectId

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.put("/photo")
async def update_photo(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user.id}_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save file")
    
    # Update user's photo_url
    photo_url = f"/uploads/{filename}"
    await db.users.update_one(
        {"_id": current_user.id},
        {"$set": {"photo_url": photo_url}}
    )
    
    return {"photo_url": photo_url}

@router.get("/gallery")
async def get_users_gallery(
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Prepare query
    query = {}
    if search:
        query["nickname"] = {"$regex": search, "$options": "i"}
    
    # Exclude current user from results
    query["_id"] = {"$ne": current_user.id}
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get total count
    total = await db.users.count_documents(query)
    
    # Get users
    cursor = db.users.find(query).skip(skip).limit(limit)
    users = []
    async for user in cursor:
        users.append({
            "id": str(user["_id"]),
            "nickname": user["nickname"],
            "photo_url": user.get("photo_url")
        })
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/profile")
async def get_profile(
    current_user: UserInDB = Depends(get_current_user)
):
    return {
        "id": str(current_user.id),
        "nickname": current_user.nickname,
        "photo_url": current_user.photo_url,
        "created_at": current_user.created_at
    }

@router.get("/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": str(user["_id"]),
            "nickname": user["nickname"],
            "photo_url": user.get("photo_url")
        }
    except:
        raise HTTPException(status_code=404, detail="User not found")
