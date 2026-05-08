from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserOut(BaseModel):
    fullName: str
    email: EmailStr
    mobile: str
    city: str
    state: str
    pincode: str
    role: str


class RegisterRequest(BaseModel):
    fullName: str = Field(min_length=2)
    email: EmailStr
    mobile: str = ""
    password: str = Field(min_length=4)
    city: str = "Bhopal"
    state: str = "Madhya Pradesh"
    pincode: str = "462001"
    role: str = "Citizen"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class LocationOut(BaseModel):
    lat: float
    lng: float
    address: str


class TimelineOut(BaseModel):
    label: str
    time: str
    note: str


class ComplaintCreate(BaseModel):
    title: str = Field(default="Untitled civic complaint")
    description: str = Field(default="")
    type: str = Field(default="Auto Detect")
    city: str = Field(default="Bhopal")
    pincode: str = Field(default="462001")
    address: str = Field(default="Selected location, India")
    lat: float = 23.2599
    lng: float = 77.4126
    imageName: str | None = None
    voiceText: str | None = None


class ComplaintOut(BaseModel):
    id: str
    title: str
    description: str
    type: str
    city: str
    pincode: str
    address: str
    location: LocationOut
    createdAt: str
    citizenName: str
    citizenEmail: str
    category: str
    department: str
    priority: str
    status: str
    estimatedTime: str
    aiConfidence: int
    duplicateRisk: int
    fraudRisk: int
    upvotes: int
    imageName: str | None = None
    voiceText: str | None = None
    officerRemark: str | None = None
    beforeProof: str | None = None
    afterProof: str | None = None
    timeline: list[TimelineOut]


class StatusUpdateRequest(BaseModel):
    status: str
    officerRemark: str | None = None


class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    time: str
    type: str


class ChatbotRequest(BaseModel):
    message: str


class ChatbotResponse(BaseModel):
    reply: str


class AdminStats(BaseModel):
    totalComplaints: int
    pending: int
    inProgress: int
    resolved: int
    emergency: int
    fraudSuspected: int
    averageResolutionTime: str
    categoryWise: dict[str, int]
    statusWise: dict[str, int]


class PublicApiInfo(BaseModel):
    name: str
    version: str
    endpoints: list[str]
    note: str


class Phase3AnalyzeRequest(BaseModel):
    title: str = "AI civic complaint"
    description: str = ""
    type: str = "Auto Detect"
    city: str = "Bhopal"
    lat: float = 23.2599
    lng: float = 77.4126
    imageName: str | None = None
    voiceText: str | None = None
    upvotes: int = 0


class ChatMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
