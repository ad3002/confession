from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager

# Global variables for database connections
mongodb_client = None
mongodb = None

@asynccontextmanager
async def lifespan(app):
    # Startup
    global mongodb_client, mongodb
    from .config import get_settings
    settings = get_settings()
    mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
    mongodb = mongodb_client.confession
    
    # Create indexes
    await mongodb.users.create_index("nickname", unique=True)
    await mongodb.notes.create_index("receiver_id")
    await mongodb.notes.create_index("sender_id")
    
    yield
    
    # Shutdown
    if mongodb_client:
        mongodb_client.close()

def get_db():
    return mongodb
