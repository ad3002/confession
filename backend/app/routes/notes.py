from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from ..models import UserInDB
from ..database import get_db
from ..dependencies import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

def generate_anonym_id(user_id: str, receiver_id: str) -> str:
    """Generate consistent anonymous ID for user pair"""
    combined = f"{user_id}_{receiver_id}"
    # Use last 6 digits of hash as anonym_id
    return f"anonym_{abs(hash(combined)) % 1000000:06d}"

@router.post("")
async def create_note(
    content: str,
    receiver_id: str,
    is_anonymous: bool = False,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Validate receiver exists
    try:
        receiver = await db.users.find_one({"_id": ObjectId(receiver_id)})
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid receiver ID")

    # Prevent self-notes
    if str(current_user.id) == receiver_id:
        raise HTTPException(status_code=400, detail="Cannot send note to yourself")

    # Create note
    note = {
        "content": content,
        "sender_id": current_user.id,
        "receiver_id": ObjectId(receiver_id),
        "is_anonymous": is_anonymous,
        "created_at": datetime.utcnow(),
        "is_read": False
    }

    # Add anonym_id if anonymous
    if is_anonymous:
        note["anonym_id"] = generate_anonym_id(str(current_user.id), receiver_id)

    result = await db.notes.insert_one(note)
    
    created_note = await db.notes.find_one({"_id": result.inserted_id})
    return {
        "id": str(created_note["_id"]),
        "content": created_note["content"],
        "sender_id": str(created_note["sender_id"]),
        "receiver_id": str(created_note["receiver_id"]),
        "is_anonymous": created_note["is_anonymous"],
        "anonym_id": created_note.get("anonym_id"),
        "created_at": created_note["created_at"]
    }

@router.get("/sent")
async def get_sent_notes(
    page: int = 1,
    limit: int = 20,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    skip = (page - 1) * limit
    total = await db.notes.count_documents({"sender_id": current_user.id})
    
    cursor = db.notes.find({"sender_id": current_user.id}) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(limit)
    
    notes = []
    async for note in cursor:
        receiver = await db.users.find_one({"_id": note["receiver_id"]})
        notes.append({
            "id": str(note["_id"]),
            "content": note["content"],
            "receiver_id": str(note["receiver_id"]),
            "receiver_nickname": receiver["nickname"],
            "is_anonymous": note["is_anonymous"],
            "created_at": note["created_at"]
        })
    
    return {
        "notes": notes,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/received")
async def get_received_notes(
    page: int = 1,
    limit: int = 20,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    skip = (page - 1) * limit
    total = await db.notes.count_documents({"receiver_id": current_user.id})
    
    cursor = db.notes.find({"receiver_id": current_user.id}) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(limit)
    
    notes = []
    async for note in cursor:
        note_data = {
            "id": str(note["_id"]),
            "content": note["content"],
            "is_anonymous": note["is_anonymous"],
            "created_at": note["created_at"],
            "is_read": note.get("is_read", False)
        }
        
        if not note["is_anonymous"]:
            sender = await db.users.find_one({"_id": note["sender_id"]})
            note_data.update({
                "sender_id": str(note["sender_id"]),
                "sender_nickname": sender["nickname"]
            })
        else:
            note_data["anonym_id"] = note.get("anonym_id")
        
        notes.append(note_data)
    
    return {
        "notes": notes,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/unread/count")
async def get_unread_count(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    count = await db.notes.count_documents({
        "receiver_id": current_user.id,
        "is_read": False
    })
    return {"count": count}

@router.put("/{note_id}/read")
async def mark_as_read(
    note_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        result = await db.notes.update_one(
            {
                "_id": ObjectId(note_id),
                "receiver_id": current_user.id
            },
            {"$set": {"is_read": True}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        
        return {"success": True}
    except:
        raise HTTPException(status_code=400, detail="Invalid note ID")
