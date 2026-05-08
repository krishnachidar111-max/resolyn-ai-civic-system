from __future__ import annotations

from datetime import datetime
import os
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Complaint
from ..schemas import Phase3AnalyzeRequest
from ..phase3_ai import analyze_phase3, mock_transcribe_audio, model_status, detect_objects_from_image

router = APIRouter(prefix="/ai", tags=["Phase-3 AI Engine"])
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def recent_complaints(db: Session):
    rows = db.query(Complaint).order_by(Complaint.created_at.desc()).limit(300).all()
    return [
        {
            "description": row.description,
            "category": row.category,
            "city": row.city,
            "lat": row.lat,
            "lng": row.lng,
        }
        for row in rows
    ]


@router.get("/model-status")
def get_model_status():
    return model_status()


@router.post("/analyze-text")
def analyze_text(payload: Phase3AnalyzeRequest, db: Session = Depends(get_db)):
    result = analyze_phase3(
        title=payload.title,
        description=payload.description,
        selected_type=payload.type,
        city=payload.city,
        lat=payload.lat,
        lng=payload.lng,
        image_name=payload.imageName,
        existing_complaints=recent_complaints(db),
        transcript=payload.voiceText,
        upvotes=payload.upvotes,
    )
    return result.dict()


@router.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    safe_name = f"ai_{int(datetime.utcnow().timestamp())}_{image.filename}"
    path = os.path.join(UPLOAD_DIR, safe_name)
    with open(path, "wb") as f:
        f.write(await image.read())
    objects = detect_objects_from_image(safe_name)
    confidence = 91 if objects and objects != ["civic evidence uploaded"] else 74
    return {
        "fileName": safe_name,
        "detectedObjects": objects,
        "confidence": confidence,
        "note": "Phase-3 demo image adapter. It is YOLOv8-ready; install ultralytics and plug model weights for real detection.",
    }


@router.post("/transcribe-voice")
async def transcribe_voice(audio: UploadFile = File(...)):
    safe_name = f"voice_{int(datetime.utcnow().timestamp())}_{audio.filename}"
    path = os.path.join(UPLOAD_DIR, safe_name)
    with open(path, "wb") as f:
        f.write(await audio.read())
    transcript = mock_transcribe_audio(audio.filename)
    return {
        "fileName": safe_name,
        "transcript": transcript,
        "confidence": 86,
        "note": "Phase-3 demo Whisper adapter. Install Whisper later for real audio transcription.",
    }


@router.post("/full-pipeline")
async def full_pipeline(
    title: str = Form("AI civic complaint"),
    description: str = Form(""),
    type: str = Form("Auto Detect"),
    city: str = Form("Bhopal"),
    lat: float = Form(23.2599),
    lng: float = Form(77.4126),
    image: UploadFile | None = File(None),
    audio: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    image_name = None
    transcript = None
    if image:
        image_name = f"ai_{int(datetime.utcnow().timestamp())}_{image.filename}"
        with open(os.path.join(UPLOAD_DIR, image_name), "wb") as f:
            f.write(await image.read())
    if audio:
        transcript = mock_transcribe_audio(audio.filename)
    result = analyze_phase3(
        title=title,
        description=description,
        selected_type=type,
        city=city,
        lat=lat,
        lng=lng,
        image_name=image_name,
        existing_complaints=recent_complaints(db),
        transcript=transcript,
    )
    return result.dict()


@router.get("/risk-zones")
def risk_zones(db: Session = Depends(get_db)):
    rows = db.query(Complaint).all()
    city_map: dict[str, dict] = {}
    for row in rows:
        data = city_map.setdefault(row.city, {"city": row.city, "count": 0, "emergency": 0, "fraud": 0, "lat": row.lat, "lng": row.lng})
        data["count"] += 1
        if row.priority == "Emergency":
            data["emergency"] += 1
        if row.fraud_risk > 60:
            data["fraud"] += 1
    zones = []
    for data in city_map.values():
        risk = min(100, data["count"] * 12 + data["emergency"] * 25 + data["fraud"] * 10)
        zones.append({**data, "riskScore": risk, "prediction": "Likely hotspot" if risk > 55 else "Monitor"})
    return sorted(zones, key=lambda x: x["riskScore"], reverse=True)
