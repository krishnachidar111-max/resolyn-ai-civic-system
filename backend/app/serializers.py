from datetime import datetime
from .models import User, Complaint, TimelineItem, Notification


def user_out(user: User) -> dict:
    return {
        "fullName": user.full_name,
        "email": user.email,
        "mobile": user.mobile,
        "city": user.city,
        "state": user.state,
        "pincode": user.pincode,
        "role": user.role,
    }


def time_text(value: datetime) -> str:
    return value.strftime("%d %b %Y, %I:%M %p")


def complaint_out(item: Complaint) -> dict:
    timeline = sorted(item.timeline, key=lambda x: x.created_at)
    return {
        "id": item.complaint_no,
        "title": item.title,
        "description": item.description,
        "type": item.type,
        "city": item.city,
        "pincode": item.pincode,
        "address": item.address,
        "location": {"lat": item.lat, "lng": item.lng, "address": item.address},
        "createdAt": item.created_at.isoformat(),
        "citizenName": item.citizen_name,
        "citizenEmail": item.citizen_email,
        "category": item.category,
        "department": item.department,
        "priority": item.priority,
        "status": item.status,
        "estimatedTime": item.estimated_time,
        "aiConfidence": item.ai_confidence,
        "duplicateRisk": item.duplicate_risk,
        "fraudRisk": item.fraud_risk,
        "upvotes": item.upvotes,
        "imageName": item.image_name,
        "voiceText": item.voice_text,
        "officerRemark": item.officer_remark,
        "beforeProof": item.before_proof,
        "afterProof": item.after_proof,
        "timeline": [
            {"label": row.label, "time": time_text(row.created_at), "note": row.note}
            for row in timeline
        ],
    }


def notification_out(item: Notification) -> dict:
    return {
        "id": f"N-{item.id}",
        "title": item.title,
        "message": item.message,
        "time": time_text(item.created_at),
        "type": item.type,
    }
