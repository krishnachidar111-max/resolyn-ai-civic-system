from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChatMessage, Complaint, Notification, User
from ..schemas import ChatMessageCreate
from ..security import get_current_user
from ..serializers import time_text

router = APIRouter(prefix="/chat", tags=["Real-Time Department Chat"])


def chat_out(row: ChatMessage) -> dict:
    return {
        "id": f"MSG-{row.id}",
        "complaintId": row.complaint_id,
        "senderRole": row.sender_role,
        "senderName": row.sender_name,
        "message": row.message,
        "time": time_text(row.created_at),
    }


@router.get("/{complaint_no}")
def get_chat(complaint_no: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.complaint_no == complaint_no).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    rows = db.query(ChatMessage).filter(ChatMessage.complaint_id == complaint.id).order_by(ChatMessage.created_at.asc()).all()
    if not rows:
        welcome = ChatMessage(
            complaint_id=complaint.id,
            sender_role="AI Assistant",
            sender_name="Resolyn Bot",
            message="Department chat opened. Officer can ask for extra proof and citizen can reply here.",
        )
        db.add(welcome)
        db.commit()
        db.refresh(welcome)
        rows = [welcome]
    return [chat_out(row) for row in rows]


@router.post("/{complaint_no}")
def send_chat(complaint_no: str, payload: ChatMessageCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.complaint_no == complaint_no).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    row = ChatMessage(
        complaint_id=complaint.id,
        sender_role=user.role,
        sender_name=user.full_name,
        message=payload.message,
    )
    db.add(row)
    if complaint.citizen_id and user.role != "Citizen":
        db.add(Notification(user_id=complaint.citizen_id, title="Officer replied", message=f"New message on {complaint_no}: {payload.message[:80]}", type="info"))
    db.commit()
    db.refresh(row)
    return chat_out(row)
