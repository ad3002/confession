from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime

from .config import get_settings
from .database import lifespan
from .routes import auth, users, notes

app = FastAPI(lifespan=lifespan)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Phase check middleware
@app.middleware("http")
async def phase_check_middleware(request: Request, call_next):
    settings = get_settings()
    
    # Endpoints that are always allowed
    allowed_endpoints = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/system/phase",
        "/docs",
        "/openapi.json"
    ]
    
    if request.url.path in allowed_endpoints:
        response = await call_next(request)
        return response
    
    # Check phase for gallery and notes endpoints
    if settings.phase == "passive" and any(x in request.url.path for x in ["/gallery", "/notes"]):
        raise HTTPException(status_code=403, detail="This feature is not available in passive phase")
    
    response = await call_next(request)
    return response

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "phase": get_settings().phase
    }

# Phase check endpoint
@app.get("/api/system/phase")
async def get_phase():
    return {
        "phase": get_settings().phase
    }
