from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from config.database import engine, Base, get_db
from app.routes.user_routes import router as user_router
from app.routes.appointment_routes import router as appointment_router
from app.routes.auth_routes import router as auth_router
from app.routes.profile_routes import router as profile_router
from app.routes.settings_routes import router as settings_router
from app.routes.doctor_routes import router as doctor_router
from app.routes import admin_routes
from app.routes.notification_routes import router as notification_router
from app.models import Document, UserAccount, Appointment  # Import Appointment model
from config.security import get_current_user
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from pathlib import Path
import os

# Create base uploads directory
UPLOAD_DIR = Path("uploads")
PROFILE_PICTURES_DIR = UPLOAD_DIR / "profile_pictures"
DOCUMENTS_DIR = UPLOAD_DIR / "documents"

# Ensure directories exist with proper permissions
UPLOAD_DIR.mkdir(exist_ok=True, mode=0o755)
PROFILE_PICTURES_DIR.mkdir(exist_ok=True, mode=0o755)
DOCUMENTS_DIR.mkdir(exist_ok=True, mode=0o755)

# Ensure directories are writable
if not os.access(UPLOAD_DIR, os.W_OK):
    raise RuntimeError(f"Upload directory {UPLOAD_DIR} is not writable")
if not os.access(PROFILE_PICTURES_DIR, os.W_OK):
    raise RuntimeError(f"Profile pictures directory {PROFILE_PICTURES_DIR} is not writable")
if not os.access(DOCUMENTS_DIR, os.W_OK):
    raise RuntimeError(f"Documents directory {DOCUMENTS_DIR} is not writable")

# Create all tables
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

# Mount the uploads directory
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Create a route to serve files with authentication
@app.get("/uploads/{file_path:path}")
async def get_file(
    file_path: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if the file exists
    file_location = UPLOAD_DIR / file_path
    if not file_location.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # For profile pictures, check if it belongs to the user
    if file_path.startswith("profile_pictures/"):
        user = db.query(UserAccount).filter(
            UserAccount.id == current_user.id,
            UserAccount.profile_picture == f"/uploads/{file_path}"
        ).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # For documents, check if it belongs to the user or if the user is a doctor with access
    elif file_path.startswith("documents/"):
        document = db.query(Document).filter(
            Document.file_path == f"/uploads/{file_path}"
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        # Allow access if the user owns the document
        if document.user_id == current_user.id:
            pass
        # Allow access if the user is a doctor with a confirmed appointment with the patient
        elif current_user.role == "doctor":
            appointment = db.query(Appointment).filter(
                Appointment.doctor_id == current_user.id,
                Appointment.user_id == document.user_id,
                Appointment.status == "confirmed"
            ).first()
            
            if not appointment:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied. No confirmed appointment with this patient."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Return the file with appropriate headers
    return FileResponse(
        file_location,
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "http://localhost:3000"
        }
    )

# Include routers
app.include_router(user_router)
app.include_router(appointment_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(notification_router)
app.include_router(settings_router)
app.include_router(admin_routes.router)
app.include_router(doctor_router)

# Add community router
from app.routes.community_routes import router as community_router
app.include_router(community_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

@app.get("/uploads/documents/{file_path:path}")
async def get_document(
    file_path: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if the document exists and belongs to the user
    document = db.query(Document).filter(
        Document.file_path == f"/uploads/documents/{file_path}",
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_location = f"uploads/documents/{file_path}"
    if not os.path.isfile(file_location):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_location)


