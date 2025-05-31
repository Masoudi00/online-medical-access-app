from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
import os
import shutil
from pathlib import Path
from fastapi.responses import FileResponse

from app.models import UserAccount, Appointment, Document
from app.schemas.appointment import Appointment as AppointmentSchema
from app.schemas.document import Document as DocumentSchema
from app.schemas.notification import NotificationCreate
from app.services import notification_service
from config.database import get_db
from config.security import get_current_user

router = APIRouter(
    prefix="/doctor",
    tags=["doctor"]
)

# Create base uploads directory
UPLOAD_DIR = Path("uploads")
DOCUMENTS_DIR = UPLOAD_DIR / "documents"

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
DOCUMENTS_DIR.mkdir(exist_ok=True)

def get_doctor_user(current_user: UserAccount = Depends(get_current_user)):
    if not current_user.is_doctor:
        raise HTTPException(status_code=403, detail="Access denied. User is not a doctor.")
    return current_user

@router.get("/calendar", response_model=List[AppointmentSchema])
async def get_doctor_calendar(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_doctor_user)
):
    """
    Get doctor's appointments with detailed patient information.
    Optionally filter by date range.
    """
    query = db.query(Appointment).options(
        joinedload(Appointment.user).joinedload(UserAccount.documents),
    ).filter(
        Appointment.doctor_id == current_user.id
    )

    # Apply date filters if provided
    if start_date:
        query = query.filter(Appointment.appointment_date >= start_date)
    if end_date:
        query = query.filter(Appointment.appointment_date <= end_date)

    # Order by appointment date
    appointments = query.order_by(Appointment.appointment_date.asc()).all()
    
    return appointments

@router.get("/documents/{document_id}")
async def get_patient_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_doctor_user)
):
    """
    Allow doctors to access patient documents if they have an appointment with the patient.
    """
    # First find the document
    document = db.query(Document).filter(Document.timestamp == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check if the doctor has an appointment with this patient
    appointment = db.query(Appointment).filter(
        Appointment.doctor_id == current_user.id,
        Appointment.user_id == document.user_id,
        Appointment.status == "confirmed"
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=403, 
            detail="Access denied. You don't have a confirmed appointment with this patient."
        )

    file_location = f"uploads/{document.file_path.replace('/uploads/', '')}"
    if not os.path.isfile(file_location):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_location)

@router.post("/patients/{patient_id}/documents", response_model=DocumentSchema)
async def upload_patient_document(
    patient_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_doctor_user)
):
    """
    Upload a document to a patient's file.
    Only allowed if the doctor has a confirmed appointment with the patient.
    """
    # Check if doctor has a confirmed appointment with this patient
    appointment = db.query(Appointment).filter(
        Appointment.doctor_id == current_user.id,
        Appointment.user_id == patient_id,
        Appointment.status == "confirmed"
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=403,
            detail="Access denied. No confirmed appointment with this patient."
        )

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
                status_code=400,
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
                    status_code=400,
                    detail=f"File size ({file_size} bytes) exceeds maximum allowed size of 10MB"
                )
        await file.seek(0)  # Reset file pointer
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = allowed_types[file.content_type]
        filename = f"{patient_id}_{timestamp}{file_extension}"
        
        # Save file
        file_path = DOCUMENTS_DIR / filename
        relative_path = f"documents/{filename}"
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Could not save the file: {str(e)}"
            )
        
        # Create document record in database
        document = Document(
            user_id=patient_id,  # Assign to patient
            name=file.filename,
            file_path=f"/uploads/{relative_path}",
            content_type=file.content_type,
            timestamp=timestamp
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        # Create notification for the patient
        notification = NotificationCreate(
            message=f"Dr. {current_user.first_name} {current_user.last_name} has uploaded a document: {file.filename}"
        )
        notification_service.create_notification(db, user_id=patient_id, notif=notification)
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        ) 