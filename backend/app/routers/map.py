from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint
from ..serializers import complaint_out

router = APIRouter(prefix="/map", tags=["Live Civic Map"])


@router.get("/complaints")
def map_complaints(db: Session = Depends(get_db)):
    rows = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(500).all()
    return [complaint_out(row) for row in rows]


@router.get("/heatmap")
def heatmap(db: Session = Depends(get_db)):
    rows = db.query(Complaint).all()
    return [
        {"lat": row.lat, "lng": row.lng, "weight": 4 if row.priority == "Emergency" else 3 if row.priority == "High" else 2}
        for row in rows
    ]
