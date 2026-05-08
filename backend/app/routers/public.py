from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint
from ..schemas import PublicApiInfo
from ..serializers import complaint_out

router = APIRouter(prefix="/public", tags=["Public API"])


@router.get("", response_model=PublicApiInfo)
def info():
    return {
        "name": "Resolyn Public Civic Data API",
        "version": "1.0-demo",
        "endpoints": ["GET /api/public/complaints", "GET /api/public/heatmap", "GET /api/public/city/{city}"],
        "note": "For hackathon demo. Add API keys, anonymization and rate limits before production.",
    }


@router.get("/complaints")
def public_complaints(db: Session = Depends(get_db)):
    rows = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(100).all()
    data = []
    for row in rows:
        item = complaint_out(row)
        item.pop("citizenEmail", None)
        item.pop("citizenName", None)
        data.append(item)
    return data


@router.get("/heatmap")
def public_heatmap(db: Session = Depends(get_db)):
    return [{"lat": row.lat, "lng": row.lng, "priority": row.priority, "category": row.category} for row in db.query(Complaint).all()]


@router.get("/city/{city}")
def public_city(city: str, db: Session = Depends(get_db)):
    rows = db.query(Complaint).filter(Complaint.city.ilike(city)).all()
    return [{"id": row.complaint_no, "category": row.category, "priority": row.priority, "status": row.status} for row in rows]
