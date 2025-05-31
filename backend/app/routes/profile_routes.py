from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from pathlib import Path

from app.controllers.profile import get_user_profile, update_user_profile, update_profile_picture
from app.schemas.user import UserProfile, UserProfileUpdate
from app.schemas.document import Document as DocumentSchema
from app.models.document import Document
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
DOCUMENTS_DIR = UPLOAD_DIR / "documents"

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
PROFILE_PICTURES_DIR.mkdir(exist_ok=True)
DOCUMENTS_DIR.mkdir(exist_ok=True)

@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: UserAccount = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_profile(db, current_user.id)

@router.put("/me", response_model=UserProfile)
async def update_my_profile(
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
            updated_user = update_profile_picture(db, current_user.id, f"/static/{relative_path}")
            
            # Return the user with the profile picture URL
            return {
                "profile_picture": f"/static/{relative_path}",
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

@router.post("/me/documents", response_model=DocumentSchema)
async def upload_document(
    file: UploadFile = File(...),
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate file type
        allowed_types = {
            'application/pdf': '.pdf',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'image/jpeg': '.jpg',
            'image/png': '.png'
        }
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. Allowed types: PDF, DOC, DOCX, JPG, PNG"
            )
        
        # Validate file size (max 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        
        while chunk := await file.read(chunk_size):
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File size ({file_size} bytes) exceeds maximum allowed size of 10MB"
                )
        await file.seek(0)  # Reset file pointer
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = allowed_types[file.content_type]
        filename = f"{current_user.id}_{timestamp}{file_extension}"
        
        # Save file
        file_path = DOCUMENTS_DIR / filename
        relative_path = f"documents/{filename}"
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not save the file: {str(e)}"
            )
        
        # Create document record in database
        document = Document(
            user_id=current_user.id,
            name=file.filename,
            file_path=f"/uploads/{relative_path}",
            content_type=file.content_type,
            timestamp=timestamp
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/me/documents", response_model=List[DocumentSchema])
async def list_documents(
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        documents = db.query(Document).filter(Document.user_id == current_user.id).all()
        return documents
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list documents: {str(e)}"
        )

@router.delete("/me/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Find the document in database
        document = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.timestamp == document_id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete the file
        file_path = Path(document.file_path.replace("/uploads/", ""))
        full_path = UPLOAD_DIR / file_path
        try:
            if full_path.exists():
                os.remove(full_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not delete the file: {str(e)}"
            )
        
        # Delete database record
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 