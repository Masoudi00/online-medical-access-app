from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from pathlib import Path

from app.controllers.profile import get_user_profile, update_user_profile, update_profile_picture
from app.schemas.user import UserProfile, UserProfileUpdate
from config.database import get_db
from config.security import get_current_user
from app.models.user import UserAccount

router = APIRouter(
    prefix="/profile",
    tags=["profile"]
)

# Create base uploads directory
UPLOAD_DIR = Path("uploads")
PROFILE_PICTURES_DIR = UPLOAD_DIR / "profile_pictures"

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
PROFILE_PICTURES_DIR.mkdir(exist_ok=True)

@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: UserAccount = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_profile(db, current_user.id)

@router.put("/me", response_model=UserProfile)
def update_my_profile(
    profile_update: UserProfileUpdate,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_user_profile(db, current_user.id, profile_update)

@router.post("/me/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. File must be an image."
            )
        
        # Validate file size (max 5MB)
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        
        while chunk := await file.read(chunk_size):
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File size ({file_size} bytes) exceeds maximum allowed size of 5MB"
                )
        await file.seek(0)  # Reset file pointer
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.jpg', '.jpeg', '.png', '.gif']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension: {file_extension}. Only JPG, PNG and GIF images are allowed."
            )
        
        filename = f"{current_user.id}_{timestamp}{file_extension}"
        
        # Save file with relative path
        relative_path = f"profile_pictures/{filename}"
        file_path = str(PROFILE_PICTURES_DIR / filename)
        
        # Save the file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not save the file: {str(e)}"
            )
        
        try:
            # Update user profile with relative path
            updated_user = update_profile_picture(db, current_user.id, f"/uploads/{relative_path}")
            
            # Return the user with the profile picture URL
            return {
                "profile_picture": f"/uploads/{relative_path}",
                "user": updated_user
            }
        except Exception as e:
            # Clean up the uploaded file if database update fails
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile picture in database: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 