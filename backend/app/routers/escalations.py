from __future__ import annotations

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint, Escalation, Notification, User
from ..security import get_current_user
from ..serializers import time_text

router = APIRouter(prefix="/escalations", tags=["Escalation Automation"])


def escalation_out(row: Escalation, complaint: Complaint | None = None) -> dict:
    return {
        "id": f"ESC-{row.id}",
        "complaintNo": complaint.complaint_no if complaint else row.complaint_id,
        "level": row.level,
        "reason": row.reason,
        "time": time_text(row.created_at),
    }


@router.get("")
def list_escalations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(Escalation).order_by(Escalation.created_at.desc()).all()
    data = []
    for row in rows:
        complaint = db.query(Complaint).filter(Complaint.id == row.complaint_id).first()
        data.append(escalation_out(row, complaint))
    return data


@router.post("/run")
def run_escalation_engine(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    created = []
    complaints = db.query(Complaint).filter(Complaint.status.notin_(["Resolved", "Verified by Citizen", "Closed"])).all()
    for complaint in complaints:
        age = now - complaint.created_at
        level = None
        reason = None
        if complaint.priority == "Emergency" and age > timedelta(hours=24):
            level = "Emergency 24h Escalation"
            reason = "Emergency complaint pending for more than 24 hours."
        elif age > timedelta(days=15):
            level = "Higher Authority Escalation"
            reason = "Complaint unresolved for 15+ days."
        elif age > timedelta(days=7):
            level = "City Admin Escalation"
            reason = "Complaint unresolved for 7+ days."
        elif age > timedelta(days=3):
            level = "Department Reminder"
            reason = "Complaint pending for 3+ days."
        if not level:
            continue
        exists = db.query(Escalation).filter(Escalation.complaint_id == complaint.id, Escalation.level == level).first()
        if exists:
            continue
        esc = Escalation(complaint_id=complaint.id, level=level, reason=reason)
        db.add(esc)
        if complaint.citizen_id:
            db.add(Notification(user_id=complaint.citizen_id, title="Complaint Escalated", message=f"{complaint.complaint_no}: {reason}", type="warning"))
        db.flush()
        created.append(escalation_out(esc, complaint))
    db.commit()
    return {"created": created, "count": len(created), "message": "Escalation engine completed."}
