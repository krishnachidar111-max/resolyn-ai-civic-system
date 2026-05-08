from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    mobile: Mapped[str] = mapped_column(String(30), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(80), default="Bhopal")
    state: Mapped[str] = mapped_column(String(80), default="Madhya Pradesh")
    pincode: Mapped[str] = mapped_column(String(12), default="462001")
    role: Mapped[str] = mapped_column(String(40), default="Citizen")
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    verification_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reset_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaints: Mapped[list["Complaint"]] = relationship(back_populates="citizen")


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    complaint_no: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(80), default="Auto Detect")
    city: Mapped[str] = mapped_column(String(80), default="Bhopal")
    pincode: Mapped[str] = mapped_column(String(12), default="462001")
    address: Mapped[str] = mapped_column(String(255), default="")
    lat: Mapped[float] = mapped_column(Float, default=23.2599)
    lng: Mapped[float] = mapped_column(Float, default=77.4126)
    citizen_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    citizen_name: Mapped[str] = mapped_column(String(120), default="Demo Citizen")
    citizen_email: Mapped[str] = mapped_column(String(180), default="citizen@demo.in")
    category: Mapped[str] = mapped_column(String(80))
    department: Mapped[str] = mapped_column(String(120))
    priority: Mapped[str] = mapped_column(String(30), default="Medium")
    status: Mapped[str] = mapped_column(String(50), default="AI Analyzed")
    estimated_time: Mapped[str] = mapped_column(String(80), default="2–3 days")
    ai_confidence: Mapped[int] = mapped_column(Integer, default=90)
    duplicate_risk: Mapped[int] = mapped_column(Integer, default=10)
    fraud_risk: Mapped[int] = mapped_column(Integer, default=5)
    upvotes: Mapped[int] = mapped_column(Integer, default=0)
    image_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    voice_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    officer_remark: Mapped[str] = mapped_column(Text, default="Waiting for department acknowledgement.")
    before_proof: Mapped[str | None] = mapped_column(String(255), nullable=True)
    after_proof: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    citizen: Mapped[User | None] = relationship(back_populates="complaints")
    timeline: Mapped[list["TimelineItem"]] = relationship(back_populates="complaint", cascade="all, delete-orphan")


class TimelineItem(Base):
    __tablename__ = "timeline_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"))
    label: Mapped[str] = mapped_column(String(80))
    note: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    complaint: Mapped[Complaint] = relationship(back_populates="timeline")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(180))
    message: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(30), default="info")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_id: Mapped[int | None] = mapped_column(ForeignKey("complaints.id"), nullable=True)
    sender_role: Mapped[str] = mapped_column(String(40))
    sender_name: Mapped[str] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Escalation(Base):
    __tablename__ = "escalations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"))
    level: Mapped[str] = mapped_column(String(80))
    reason: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
