from datetime import datetime
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import random
from ..database import get_db
from ..models import Complaint, TimelineItem, Notification, User
from ..schemas import ComplaintCreate, ComplaintOut, StatusUpdateRequest
from ..security import get_current_user
from ..phase3_ai import analyze_phase3
from ..serializers import complaint_out

router = APIRouter(prefix="/complaints", tags=["Complaints"])
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def make_complaint_no() -> str:
    return f"RSL-{datetime.utcnow().year}-{random.randint(10000, 99999)}"


def existing_for_ai(db: Session):
    rows = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(200).all()
    return [{"description": r.description, "category": r.category, "city": r.city} for r in rows]


@router.post("", response_model=ComplaintOut)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ai = analyze_phase3(payload.title, payload.description or payload.voiceText or "", payload.type, payload.city, payload.lat, payload.lng, payload.imageName, existing_for_ai(db), payload.voiceText)
    complaint_no = make_complaint_no()
    while db.query(Complaint).filter(Complaint.complaint_no == complaint_no).first():
        complaint_no = make_complaint_no()
    item = Complaint(
        complaint_no=complaint_no,
        title=payload.title or "Untitled civic complaint",
        description=payload.description or payload.voiceText or "Complaint description not provided.",
        type=payload.type,
        city=payload.city or user.city,
        pincode=payload.pincode or user.pincode,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
        citizen_id=user.id,
        citizen_name=user.full_name,
        citizen_email=user.email,
        category=ai.category,
        department=ai.department,
        priority=ai.priority,
        status="AI Analyzed",
        estimated_time=ai.estimated_time,
        ai_confidence=ai.ai_confidence,
        duplicate_risk=ai.duplicate_risk,
        fraud_risk=ai.fraud_risk,
        upvotes=random.randint(0, 8),
        image_name=payload.imageName,
        voice_text=payload.voiceText,
        officer_remark="Waiting for department acknowledgement.",
    )
    db.add(item)
    db.flush()
    db.add_all([
        TimelineItem(complaint_id=item.id, label="Submitted", note="Complaint submitted successfully."),
        TimelineItem(complaint_id=item.id, label="AI Analyzed", note=f"AI detected {ai.category}, {ai.priority} priority and assigned {ai.department}."),
    ])
    db.add(Notification(user_id=user.id, title="Complaint Submitted", message=f"{complaint_no} analyzed and assigned to {ai.department}.", type="success" if ai.priority != "Emergency" else "danger"))
    db.commit()
    db.refresh(item)
    return complaint_out(item)


@router.post("/with-file", response_model=ComplaintOut)
def create_complaint_with_file(
    title: str = Form("Untitled civic complaint"),
    description: str = Form(""),
    type: str = Form("Auto Detect"),
    city: str = Form("Bhopal"),
    pincode: str = Form("462001"),
    address: str = Form("Selected location, India"),
    lat: float = Form(23.2599),
    lng: float = Form(77.4126),
    voiceText: str = Form(""),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    image_name = None
    if image:
        image_name = f"{int(datetime.utcnow().timestamp())}_{image.filename}"
        with open(os.path.join(UPLOAD_DIR, image_name), "wb") as f:
            f.write(image.file.read())
    payload = ComplaintCreate(title=title, description=description, type=type, city=city, pincode=pincode, address=address, lat=lat, lng=lng, imageName=image_name, voiceText=voiceText)
    return create_complaint(payload, db, user)


@router.get("", response_model=list[ComplaintOut])
def list_complaints(
    status: str | None = None,
    category: str | None = None,
    city: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Complaint)
    if user.role not in ["Admin", "Department Officer"]:
        query = query.filter(Complaint.citizen_id == user.id)
    if status:
        query = query.filter(Complaint.status == status)
    if category:
        query = query.filter(Complaint.category == category)
    if city:
        query = query.filter(Complaint.city == city)
    return [complaint_out(row) for row in query.order_by(Complaint.created_at.desc()).all()]


@router.get("/track/{complaint_no}", response_model=ComplaintOut)
def track_complaint(complaint_no: str, db: Session = Depends(get_db)):
    item = db.query(Complaint).filter(Complaint.complaint_no == complaint_no).first()
    if not item:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint_out(item)


@router.patch("/{complaint_no}/status", response_model=ComplaintOut)
def update_status(complaint_no: str, payload: StatusUpdateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role not in ["Admin", "Department Officer", "NGO Partner"]:
        raise HTTPException(status_code=403, detail="Only admin/department/NGO can update status")
    item = db.query(Complaint).filter(Complaint.complaint_no == complaint_no).first()
    if not item:
        raise HTTPException(status_code=404, detail="Complaint not found")
    item.status = payload.status
    if payload.officerRemark:
        item.officer_remark = payload.officerRemark
    else:
        item.officer_remark = "Issue resolved. Citizen verification pending." if payload.status == "Resolved" else f"Status updated to {payload.status}."
    db.add(TimelineItem(complaint_id=item.id, label=payload.status, note=item.officer_remark))
    if item.citizen_id:
        db.add(Notification(user_id=item.citizen_id, title="Complaint Status Updated", message=f"{item.complaint_no} status changed to {payload.status}.", type="info"))
    db.commit()
    db.refresh(item)
    return complaint_out(item)


@router.post("/{complaint_no}/upvote", response_model=ComplaintOut)
def upvote(complaint_no: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(Complaint).filter(Complaint.complaint_no == complaint_no).first()
    if not item:
        raise HTTPException(status_code=404, detail="Complaint not found")
    item.upvotes += 1
    db.commit()
    db.refresh(item)
    return complaint_out(item)
