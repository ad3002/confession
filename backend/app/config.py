from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    # MongoDB settings
    mongodb_url: str = "mongodb://localhost:27017/"
    mongodb_db: str = "confession"
    
    # Application phase
    phase: str = "passive"
    
    # JWT settings
    jwt_secret: str = "your-super-secret-key"  # В продакшене должен быть заменен на безопасный ключ
    jwt_algorithm: str = "HS256"
    access_token_expire_days: int = 30
    
    # Upload settings
    upload_folder: str = "uploads"
    max_upload_size: int = 5_242_880  # 5MB in bytes
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Ensure upload directory exists
settings = get_settings()
os.makedirs(settings.upload_folder, exist_ok=True)
