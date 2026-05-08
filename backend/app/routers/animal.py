from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import ComplaintCreate, ComplaintOut
from ..security import get_current_user
from .complaints import create_complaint

router = APIRouter(prefix="/animal", tags=["Animal Emergency"])


@router.post("/report", response_model=ComplaintOut)
def report_animal(payload: ComplaintCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    payload.type = "Animal Emergency"
    if not payload.title:
        payload.title = "Animal rescue emergency"
    return create_complaint(payload, db, user)
