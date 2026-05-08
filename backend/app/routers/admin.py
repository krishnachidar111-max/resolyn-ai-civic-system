from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint, User, Escalation
from ..schemas import AdminStats
from ..security import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
def stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    complaints = db.query(Complaint).all()
    category = Counter([c.category for c in complaints])
    status = Counter([c.status for c in complaints])
    return {
        "totalComplaints": len(complaints),
        "pending": status.get("Submitted", 0) + status.get("AI Analyzed", 0) + status.get("Assigned to Department", 0),
        "inProgress": status.get("In Progress", 0),
        "resolved": status.get("Resolved", 0) + status.get("Verified by Citizen", 0) + status.get("Closed", 0),
        "emergency": sum(1 for c in complaints if c.priority == "Emergency"),
        "fraudSuspected": sum(1 for c in complaints if c.fraud_risk > 60),
        "averageResolutionTime": "3.4d",
        "categoryWise": dict(category),
        "statusWise": dict(status),
    }


@router.post("/run-escalation")
def run_escalation(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    escalated = 0
    for item in db.query(Complaint).filter(Complaint.status.in_(["Submitted", "AI Analyzed", "Assigned to Department", "In Progress"])).all():
        if item.priority == "Emergency":
            db.add(Escalation(complaint_id=item.id, level="Urgent Escalation", reason="Emergency complaint needs fast action."))
            escalated += 1
    db.commit()
    return {"message": f"Escalation check completed. {escalated} emergency cases marked."}
