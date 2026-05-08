from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime
from math import sqrt
from pathlib import Path
import re
from typing import Iterable

# Phase-3 is designed to run on normal laptops without heavy ML downloads.
# If you later install YOLOv8 / Whisper, the same router can be extended easily.

CATEGORY_RULES = [
    {
        "category": "Animal Emergency",
        "department": "Verified NGO Rescue Network",
        "keywords": ["dog", "cow", "cat", "animal", "injured", "rescue", "pashu", "janwar", "kutte", "gai", "puppy", "blood"],
        "base": 85,
    },
    {
        "category": "Electricity",
        "department": "Electricity Department",
        "keywords": ["electric", "electricity", "light", "wire", "spark", "bijli", "current", "transformer", "pole", "street light"],
        "base": 82,
    },
    {
        "category": "Water Supply",
        "department": "Water Department",
        "keywords": ["water", "pani", "pipe", "leak", "supply", "tank", "dirty water", "nal", "tap"],
        "base": 78,
    },
    {
        "category": "Road Damage",
        "department": "Road & Transport Department",
        "keywords": ["road", "pothole", "gaddha", "sadak", "accident", "traffic", "bridge", "crack", "broken road"],
        "base": 84,
    },
    {
        "category": "Garbage/Sanitation",
        "department": "Municipal Sanitation Department",
        "keywords": ["garbage", "kachra", "sanitation", "waste", "dustbin", "clean", "collection", "smell", "dirty"],
        "base": 78,
    },
    {
        "category": "Drainage",
        "department": "Drainage & Sewer Department",
        "keywords": ["drain", "nali", "sewer", "overflow", "blocked", "waterlogging", "flood", "naala"],
        "base": 80,
    },
    {
        "category": "Public Safety",
        "department": "Public Safety Department",
        "keywords": ["danger", "crime", "fight", "fire", "emergency", "unsafe", "hospital", "school", "risk"],
        "base": 86,
    },
    {
        "category": "Social Help",
        "department": "Social Welfare Department",
        "keywords": ["lost person", "mentally", "homeless", "old person", "child", "help", "elderly", "missing"],
        "base": 76,
    },
]

EMERGENCY_WORDS = ["fire", "spark", "sparks", "current", "wire toot", "injured", "blood", "accident", "trapped", "flood", "emergency", "urgent", "danger"]
HIGH_WORDS = ["hospital", "school", "public", "unsafe", "overflow", "blocked", "broken", "night", "children", "elderly"]
SPAM_WORDS = ["test test", "asdf", "spam", "fake", "random", "abuse", "gaali", "qwerty", "xxxxx"]

@dataclass
class Phase3AIResult:
    category: str
    department: str
    priority: str
    priority_score: int
    estimated_time: str
    ai_confidence: int
    duplicate_risk: int
    fraud_risk: int
    detected_objects: list[str]
    severity_reasons: list[str]
    suggested_actions: list[str]
    transcript: str | None = None

    def dict(self) -> dict:
        return asdict(self)


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z0-9]+", normalize(text))


def vectorize(text: str) -> dict[str, float]:
    counts: dict[str, float] = {}
    for token in tokenize(text):
        if len(token) < 2:
            continue
        counts[token] = counts.get(token, 0.0) + 1.0
    return counts


def cosine(a: dict[str, float], b: dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    common = set(a) & set(b)
    dot = sum(a[t] * b[t] for t in common)
    mag_a = sqrt(sum(v * v for v in a.values()))
    mag_b = sqrt(sum(v * v for v in b.values()))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def detect_category(text: str, selected_type: str = "Auto Detect") -> tuple[str, str, int, list[str]]:
    selected = (selected_type or "Auto Detect").strip()
    if selected not in ["Auto Detect", "Other", ""]:
        for rule in CATEGORY_RULES:
            if rule["category"].lower() == selected.lower():
                return rule["category"], rule["department"], 94, [f"Citizen selected {rule['category']}."]
        return selected, f"{selected} Department", 88, ["Used user selected category."]

    lowered = normalize(text)
    best_rule = None
    best_hits: list[str] = []
    best_score = -1
    for rule in CATEGORY_RULES:
        hits = [kw for kw in rule["keywords"] if kw in lowered]
        score = len(hits) * 12 + int(rule["base"])
        if hits and score > best_score:
            best_rule = rule
            best_score = score
            best_hits = hits

    if not best_rule:
        return "Other", "Civic Helpdesk", 64, ["No strong keyword found, routed to civic helpdesk."]

    confidence = min(98, best_score)
    return best_rule["category"], best_rule["department"], confidence, [f"Matched civic terms: {', '.join(best_hits[:5])}."]


def detect_objects_from_image(filename: str | None) -> list[str]:
    if not filename:
        return []
    name = normalize(Path(filename).name)
    rules = {
        "pothole": ["pothole", "road", "gaddha", "crack", "sadak"],
        "garbage pile": ["garbage", "trash", "kachra", "waste", "dustbin"],
        "injured animal": ["dog", "cow", "cat", "animal", "injured", "rescue"],
        "water leakage": ["water", "pipe", "leak", "drain", "sewer", "flood"],
        "electric wire hazard": ["wire", "electric", "spark", "pole", "bijli"],
    }
    detected = []
    for label, words in rules.items():
        if any(word in name for word in words):
            detected.append(label)
    return detected or ["civic evidence uploaded"]


def duplicate_score(text: str, city: str, lat: float | None, lng: float | None, category: str, existing: Iterable[dict]) -> tuple[int, list[str]]:
    target_vec = vectorize(text)
    best = 0
    reasons: list[str] = []
    for item in existing:
        if item.get("category") != category:
            continue
        ratio = cosine(target_vec, vectorize(item.get("description", "")))
        city_boost = 0.12 if normalize(item.get("city", "")) == normalize(city) else 0
        distance_boost = 0
        try:
            if lat is not None and lng is not None:
                if abs(float(item.get("lat", 999)) - float(lat)) < 0.03 and abs(float(item.get("lng", 999)) - float(lng)) < 0.03:
                    distance_boost = 0.18
        except Exception:
            distance_boost = 0
        score = int(min(0.99, ratio + city_boost + distance_boost) * 100)
        if score > best:
            best = score
    if best >= 70:
        reasons.append(f"Similar complaint cluster found with {best}% duplicate risk.")
    elif best >= 40:
        reasons.append("Some similarity found, but it may be a separate issue.")
    else:
        reasons.append("No strong duplicate found in recent complaints.")
    return max(best, 8), reasons


def fraud_score(text: str, image_name: str | None, category: str, detected_objects: list[str]) -> tuple[int, list[str]]:
    lowered = normalize(text)
    risk = 5
    reasons: list[str] = []
    if len(lowered) < 20:
        risk += 25
        reasons.append("Complaint text is too short.")
    if any(word in lowered for word in SPAM_WORDS):
        risk += 45
        reasons.append("Spam/fake words detected.")
    if re.search(r"(.)\1{7,}", lowered):
        risk += 30
        reasons.append("Repeated characters detected.")
    if image_name and detected_objects:
        object_text = " ".join(detected_objects)
        if category == "Road Damage" and not any(x in object_text for x in ["pothole", "road", "civic"]):
            risk += 18
            reasons.append("Uploaded image may not match road complaint.")
        if category == "Animal Emergency" and "animal" not in object_text and "civic evidence" not in object_text:
            risk += 18
            reasons.append("Uploaded image may not match animal emergency.")
    if not reasons:
        reasons.append("No major fraud indicator detected.")
    return min(risk, 96), reasons


def compute_priority(text: str, category: str, duplicate_risk: int, fraud_risk: int, detected_objects: list[str], upvotes: int = 0) -> tuple[str, int, str, list[str]]:
    lowered = normalize(text)
    score = 35
    reasons: list[str] = []
    if category in ["Animal Emergency", "Public Safety", "Electricity"]:
        score += 18
        reasons.append(f"{category} has public safety impact.")
    if any(word in lowered for word in EMERGENCY_WORDS):
        score += 32
        reasons.append("Emergency words detected in complaint.")
    if any(word in lowered for word in HIGH_WORDS):
        score += 14
        reasons.append("Sensitive/high-risk location or wording detected.")
    if any(obj in detected_objects for obj in ["electric wire hazard", "injured animal"]):
        score += 22
        reasons.append("Uploaded evidence indicates urgent risk.")
    if any(obj in detected_objects for obj in ["pothole", "water leakage", "garbage pile"]):
        score += 10
        reasons.append("Uploaded evidence supports civic issue severity.")
    if duplicate_risk > 70:
        score += 12
        reasons.append("Multiple similar reports increase priority.")
    if upvotes >= 10:
        score += 8
        reasons.append("High citizen upvotes increase priority.")
    if fraud_risk > 70:
        score = min(score, 35)
        reasons.append("High fraud risk requires manual verification before escalation.")
    score = max(1, min(100, score))
    if score >= 88:
        return "Emergency", score, "Within 24 hours", reasons
    if score >= 70:
        return "High", score, "2–3 days", reasons
    if score >= 45:
        return "Medium", score, "3–5 days", reasons
    return "Low", score, "Manual verification required", reasons


def suggested_actions(category: str, priority: str, fraud_risk: int) -> list[str]:
    actions = []
    if fraud_risk > 70:
        return ["Hold complaint for manual verification.", "Ask citizen for clearer proof and location confirmation."]
    if category == "Electricity":
        actions.append("Notify electricity field team immediately.")
        if priority == "Emergency":
            actions.append("Create safety barricade and emergency dispatch ticket.")
    elif category == "Road Damage":
        actions.append("Assign road inspection team and request before/after repair proof.")
    elif category == "Animal Emergency":
        actions.append("Alert nearest verified NGO/rescue team.")
        actions.append("Share live location and animal photo with NGO panel.")
    elif category == "Water Supply":
        actions.append("Forward to ward water supervisor and check nearby duplicate reports.")
    elif category == "Garbage/Sanitation":
        actions.append("Schedule sanitation vehicle and mark area for follow-up inspection.")
    else:
        actions.append("Route to civic helpdesk for human review.")
    if priority in ["High", "Emergency"]:
        actions.append("Show complaint in red/high-priority admin queue.")
    return actions


def mock_transcribe_audio(filename: str | None) -> str:
    name = normalize(filename or "voice")
    if "road" in name or "pothole" in name or "gaddha" in name:
        return "Hamare area me road par bada pothole hai, accident ho sakta hai."
    if "water" in name or "pani" in name:
        return "Teen din se pani nahi aa raha hai, please jaldi action lijiye."
    if "electric" in name or "wire" in name or "spark" in name:
        return "Electric wire toot gaya hai aur sparks aa rahe hain, emergency hai."
    if "animal" in name or "dog" in name:
        return "Sadak ke side injured dog pada hai, rescue urgently required."
    return "Mere area me civic issue hai, location par jaldi inspection ki zarurat hai."


def analyze_phase3(
    title: str,
    description: str,
    selected_type: str = "Auto Detect",
    city: str = "Bhopal",
    lat: float | None = None,
    lng: float | None = None,
    image_name: str | None = None,
    existing_complaints: Iterable[dict] = (),
    transcript: str | None = None,
    upvotes: int = 0,
) -> Phase3AIResult:
    text = f"{title} {description} {transcript or ''} {image_name or ''}".strip()
    category, department, confidence, category_reasons = detect_category(text, selected_type)
    detected_objects = detect_objects_from_image(image_name)
    dup, dup_reasons = duplicate_score(text, city, lat, lng, category, existing_complaints)
    fraud, fraud_reasons = fraud_score(text, image_name, category, detected_objects)
    priority, priority_score, eta, priority_reasons = compute_priority(text, category, dup, fraud, detected_objects, upvotes)
    reasons = category_reasons + dup_reasons + priority_reasons + fraud_reasons
    return Phase3AIResult(
        category=category,
        department=department,
        priority=priority,
        priority_score=priority_score,
        estimated_time=eta,
        ai_confidence=confidence,
        duplicate_risk=dup,
        fraud_risk=fraud,
        detected_objects=detected_objects,
        severity_reasons=reasons[:8],
        suggested_actions=suggested_actions(category, priority, fraud),
        transcript=transcript,
    )


def model_status() -> dict:
    return {
        "phase": "Phase-3 AI Ready",
        "nlp_classifier": "Active - rule + vector similarity civic NLP",
        "duplicate_detection": "Active - cosine similarity + location/city clustering",
        "severity_engine": "Active - 100 point smart priority score",
        "fraud_detection": "Active - spam/mismatch heuristics",
        "yolov8": "Demo adapter active. Install ultralytics later for real YOLOv8 model.",
        "whisper": "Demo adapter active. Install faster-whisper/openai-whisper later for real voice transcription.",
        "last_checked": datetime.utcnow().isoformat() + "Z",
    }
