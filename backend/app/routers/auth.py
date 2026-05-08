from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
from ..database import get_db
from ..models import User, Notification
from ..schemas import RegisterRequest, LoginRequest, AuthResponse, ForgotPasswordRequest, VerifyEmailRequest
from ..security import create_access_token, get_current_user, hash_password, verify_password
from ..serializers import user_out

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(
        full_name=payload.fullName,
        email=payload.email.lower(),
        mobile=payload.mobile,
        password_hash=hash_password(payload.password),
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        role=payload.role,
        is_verified=True,
        verification_code=str(secrets.randbelow(899999) + 100000),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.add(Notification(user_id=user.id, title="Welcome to Resolyn", message="Your account is ready. You can submit and track civic complaints.", type="success"))
    db.commit()
    return {"accessToken": create_access_token(user.email), "tokenType": "bearer", "user": user_out(user)}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return {"accessToken": create_access_token(user.email), "tokenType": "bearer", "user": user_out(user)}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user_out(user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user:
        user.reset_code = str(secrets.randbelow(899999) + 100000)
        db.commit()
    return {"message": "If the email exists, a demo reset code has been generated."}


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    user.verification_code = None
    db.commit()
    return {"message": "Email verified successfully."}
