import token
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Annotated
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, (str, ObjectId)):
            raise ValueError("Invalid ObjectId")
        return str(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserBase(BaseModel):
    nickname: str
    photo_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "nickname": "john_doe",
            "password": "strongpassword123",
            "photo_url": None
        }
    })

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    password: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserLogin(BaseModel):
    nickname: str
    password: str

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "nickname": "john_doe",
            "password": "strongpassword123"
        }
    })

# Note Models
class NoteCreate(BaseModel):
    content: str
    receiver_id: str
    is_anonymous: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Hello, this is a test note!",
                "receiver_id": "507f1f77bcf86cd799439011",
                "is_anonymous": True
            }
        }

class Note(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    content: str
    sender_id: PyObjectId
    receiver_id: PyObjectId
    is_anonymous: bool = False
    anonym_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "content": "Hello, this is a test note!",
                "sender_id": "507f1f77bcf86cd799439011",
                "receiver_id": "507f1f77bcf86cd799439012",
                "is_anonymous": True,
                "anonym_id": "anonym_123456",
                "created_at": "2023-11-01T12:00:00Z",
                "is_read": False
            }
        }
    )

# Response Models
class UserResponse(BaseModel):
    id: str
    nickname: str
    photo_url: Optional[str] = None


class LoginResponse(BaseModel):
    id: str
    nickname: str
    photo_url: Optional[str] = None
    token: str


class NoteResponse(BaseModel):
    id: str
    content: str
    sender_id: Optional[str] = None
    sender_nickname: Optional[str] = None
    receiver_id: Optional[str] = None
    receiver_nickname: Optional[str] = None
    is_anonymous: bool
    anonym_id: Optional[str] = None
    created_at: datetime
    is_read: Optional[bool] = None

class PaginatedResponse(BaseModel):
    total: int
    page: int
    pages: int

class UserGalleryResponse(PaginatedResponse):
    users: list[UserResponse]

class NotesResponse(PaginatedResponse):
    notes: list[NoteResponse]

class UnreadCountResponse(BaseModel):
    count: int

class SuccessResponse(BaseModel):
    success: bool
