from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.database import engine, Base
from app.routes.user_routes import router as user_router
from app.routes.appointment_routes import router as appointment_router
from app.routes.auth_routes import router as auth_router
from app.routes.profile_routes import router as profile_router
from app.routes import admin_routes
from app.routes.notification_routes import router as notification_router


from pathlib import Path
import os

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
PROFILE_PICTURES_DIR = UPLOAD_DIR / "profile_pictures"

# Ensure directories exist with proper permissions
UPLOAD_DIR.mkdir(exist_ok=True, mode=0o755)
PROFILE_PICTURES_DIR.mkdir(exist_ok=True, mode=0o755)

# Ensure directories are writable
if not os.access(UPLOAD_DIR, os.W_OK):
    raise RuntimeError(f"Upload directory {UPLOAD_DIR} is not writable")
if not os.access(PROFILE_PICTURES_DIR, os.W_OK):
    raise RuntimeError(f"Profile pictures directory {PROFILE_PICTURES_DIR} is not writable")

Base.metadata.create_all(bind=engine)   

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Content-Length"]
)

# Mount static files for profile pictures
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(user_router)
app.include_router(appointment_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(notification_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

app.include_router(admin_routes.router)


