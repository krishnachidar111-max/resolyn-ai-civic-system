from sqlalchemy.orm import Session
from .models import User, Complaint, TimelineItem, Notification
from .security import hash_password
from .phase3_ai import analyze_phase3

SEED_USERS = [
    {
        "full_name": "Resolyn Admin",
        "email": "admin@resolyn.in",
        "mobile": "9999999999",
        "password": "admin123",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "pincode": "462001",
        "role": "Admin",
    },
    {
        "full_name": "Demo Citizen",
        "email": "citizen@resolyn.in",
        "mobile": "8888888888",
        "password": "citizen123",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "pincode": "462001",
        "role": "Citizen",
    },
    {
        "full_name": "Road Officer",
        "email": "officer@resolyn.in",
        "mobile": "7777777777",
        "password": "officer123",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "pincode": "462001",
        "role": "Department Officer",
    },
    {
        "full_name": "Paws NGO Partner",
        "email": "ngo@resolyn.in",
        "mobile": "6666666666",
        "password": "ngo123",
        "city": "Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "role": "NGO Partner",
    },
]

SEED_COMPLAINTS = [
    {
        "complaint_no": "RSL-2026-24891",
        "title": "Large pothole near main road",
        "description": "Hamare area me road par bada pothole hai, accident ho sakta hai.",
        "type": "Road Damage",
        "city": "Bhopal",
        "pincode": "462001",
        "address": "MP Nagar Zone 1, Bhopal",
        "lat": 23.2599,
        "lng": 77.4126,
        "status": "In Progress",
        "upvotes": 43,
    },
    {
        "complaint_no": "RSL-2026-56102",
        "title": "Electric wire sparks",
        "description": "Electric wire toot gaya hai aur sparks aa rahe hain.",
        "type": "Electricity",
        "city": "Indore",
        "pincode": "452001",
        "address": "Rajwada, Indore",
        "lat": 22.7196,
        "lng": 75.8577,
        "status": "Assigned to Department",
        "upvotes": 19,
    },
    {
        "complaint_no": "RSL-2026-77210",
        "title": "Injured dog rescue needed",
        "description": "Sadak ke side injured dog pada hai, rescue urgently required.",
        "type": "Animal Emergency",
        "city": "Delhi",
        "pincode": "110001",
        "address": "Connaught Place, Delhi",
        "lat": 28.6139,
        "lng": 77.209,
        "status": "In Progress",
        "upvotes": 58,
    },
    {
        "complaint_no": "RSL-2026-44018",
        "title": "Garbage not collected",
        "description": "Garbage collection 5 din se nahi hua, bad smell aa rahi hai.",
        "type": "Garbage/Sanitation",
        "city": "Mumbai",
        "pincode": "400053",
        "address": "Andheri, Mumbai",
        "lat": 19.1197,
        "lng": 72.8468,
        "status": "AI Analyzed",
        "upvotes": 11,
    },
]


def seed_database(db: Session) -> None:
    if not db.query(User).first():
        users = []
        for row in SEED_USERS:
            user = User(
                full_name=row["full_name"],
                email=row["email"],
                mobile=row["mobile"],
                password_hash=hash_password(row["password"]),
                city=row["city"],
                state=row["state"],
                pincode=row["pincode"],
                role=row["role"],
                is_verified=True,
            )
            db.add(user)
            users.append(user)
        db.commit()
        for user in users:
            db.refresh(user)
            db.add(Notification(user_id=user.id, title="Welcome to Resolyn", message="Phase-3 backend is connected with real AI-ready endpoints, chat, escalation and analytics.", type="success"))
        db.commit()

    if not db.query(Complaint).first():
        citizen = db.query(User).filter(User.email == "citizen@resolyn.in").first()
        existing = []
        for row in SEED_COMPLAINTS:
            ai = analyze_phase3(row["title"], row["description"], row["type"], row["city"], row["lat"], row["lng"], None, existing)
            item = Complaint(
                complaint_no=row["complaint_no"],
                title=row["title"],
                description=row["description"],
                type=row["type"],
                city=row["city"],
                pincode=row["pincode"],
                address=row["address"],
                lat=row["lat"],
                lng=row["lng"],
                citizen_id=citizen.id if citizen else None,
                citizen_name=citizen.full_name if citizen else "Demo Citizen",
                citizen_email=citizen.email if citizen else "citizen@resolyn.in",
                category=ai.category,
                department=ai.department,
                priority=ai.priority,
                status=row["status"],
                estimated_time=ai.estimated_time,
                ai_confidence=ai.ai_confidence,
                duplicate_risk=ai.duplicate_risk,
                fraud_risk=ai.fraud_risk,
                upvotes=row["upvotes"],
                officer_remark="Team assigned for inspection." if row["status"] == "In Progress" else "Waiting for department acknowledgement.",
            )
            db.add(item)
            db.flush()
            db.add_all([
                TimelineItem(complaint_id=item.id, label="Submitted", note="Complaint received from citizen."),
                TimelineItem(complaint_id=item.id, label="AI Analyzed", note=f"AI detected {ai.category} and assigned {ai.department}."),
            ])
            if row["status"] not in ["Submitted", "AI Analyzed"]:
                db.add(TimelineItem(complaint_id=item.id, label=row["status"], note=f"Status moved to {row['status']}."))
            existing.append({"description": row["description"], "category": ai.category, "city": row["city"]})
        db.commit()
