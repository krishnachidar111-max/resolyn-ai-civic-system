from __future__ import annotations
from dataclasses import dataclass
import re
from difflib import SequenceMatcher

CATEGORY_RULES = [
    ("Animal Emergency", "Verified NGO Rescue Network", ["dog", "cow", "cat", "animal", "injured", "rescue", "pashu", "janwar", "kutte", "gai"]),
    ("Electricity", "Electricity Department", ["electric", "light", "wire", "spark", "bijli", "current", "transformer", "street light"]),
    ("Water Supply", "Water Department", ["water", "pani", "pipe", "leak", "supply", "tank", "sewer water"]),
    ("Road Damage", "Road & Transport Department", ["road", "pothole", "gaddha", "sadak", "accident", "traffic", "bridge"]),
    ("Garbage/Sanitation", "Municipal Sanitation Department", ["garbage", "kachra", "sanitation", "waste", "dustbin", "clean", "collection"]),
    ("Drainage", "Drainage & Sewer Department", ["drain", "nali", "sewer", "overflow", "blocked", "waterlogging", "flood"]),
    ("Public Safety", "Public Safety Department", ["danger", "crime", "fight", "fire", "emergency", "unsafe", "hospital", "school"]),
    ("Social Help", "Social Welfare Department", ["lost person", "mentally", "homeless", "old person", "child", "help"]),
]

HIGH_WORDS = ["accident", "danger", "unsafe", "hospital", "school", "sparks", "overflow", "blocked", "injured", "rescue", "public safety"]
EMERGENCY_WORDS = ["fire", "spark", "sparks", "current", "wire toot", "injured", "blood", "accident", "trapped", "flood", "emergency", "urgent"]
SPAM_WORDS = ["test test", "asdf", "spam", "fake", "random", "abuse", "gaali"]

@dataclass
class AIResult:
    category: str
    department: str
    priority: str
    estimated_time: str
    ai_confidence: int
    duplicate_risk: int
    fraud_risk: int


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z0-9]+", text.lower()))


def detect_category(text: str, selected_type: str = "Auto Detect") -> tuple[str, str, int]:
    if selected_type and selected_type != "Auto Detect" and selected_type != "Other":
        for cat, dept, _ in CATEGORY_RULES:
            if cat.lower() == selected_type.lower():
                return cat, dept, 94
        return selected_type, f"{selected_type} Department", 88

    lowered = text.lower()
    best = ("Other", "Civic Helpdesk", 62)
    best_score = 0
    for category, department, keywords in CATEGORY_RULES:
        score = sum(1 for kw in keywords if kw in lowered)
        if score > best_score:
            best_score = score
            best = (category, department, min(98, 78 + score * 6))
    return best


def detect_priority(text: str, category: str, duplicate_risk: int, near_sensitive_zone: bool = False) -> tuple[str, str]:
    lowered = text.lower()
    if category == "Animal Emergency" or any(word in lowered for word in EMERGENCY_WORDS):
        return "Emergency", "Within 24 hours"
    if any(word in lowered for word in HIGH_WORDS) or duplicate_risk > 70 or near_sensitive_zone:
        return "High", "2–3 days"
    if any(word in lowered for word in ["3 din", "5 din", "many", "regular", "daily", "bar bar"]):
        return "Medium", "3–5 days"
    return "Medium", "3–5 days"


def duplicate_score(text: str, city: str, category: str, existing: list[dict]) -> int:
    if not existing:
        return 8
    max_score = 0
    for item in existing:
        if item.get("category") != category:
            continue
        city_boost = 15 if item.get("city", "").lower() == city.lower() else 0
        ratio = SequenceMatcher(None, text.lower(), item.get("description", "").lower()).ratio()
        score = int(ratio * 85) + city_boost
        max_score = max(max_score, min(score, 99))
    return max(max_score, 10)


def fraud_score(text: str, image_name: str | None, category: str) -> int:
    lowered = text.lower().strip()
    risk = 5
    if len(lowered) < 15:
        risk += 25
    if any(word in lowered for word in SPAM_WORDS):
        risk += 45
    if re.search(r"(.)\1{7,}", lowered):
        risk += 30
    if image_name:
        img = image_name.lower()
        if category == "Road Damage" and any(x in img for x in ["food", "selfie", "cat"]):
            risk += 35
        if category == "Animal Emergency" and any(x in img for x in ["road", "building", "bill"]):
            risk += 20
    return min(risk, 96)


def analyze_complaint(
    title: str,
    description: str,
    selected_type: str,
    image_name: str | None,
    city: str,
    existing_complaints: list[dict],
    near_sensitive_zone: bool = False,
) -> AIResult:
    text = f"{title} {description} {image_name or ''}".strip()
    category, department, confidence = detect_category(text, selected_type)
    dup = duplicate_score(text, city, category, existing_complaints)
    priority, eta = detect_priority(text, category, dup, near_sensitive_zone)
    fraud = fraud_score(text, image_name, category)
    if fraud > 70:
        priority = "Low"
        eta = "Manual verification required"
    return AIResult(
        category=category,
        department=department,
        priority=priority,
        estimated_time=eta,
        ai_confidence=confidence,
        duplicate_risk=dup,
        fraud_risk=fraud,
    )
