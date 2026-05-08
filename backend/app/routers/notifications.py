from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Notification, User
from ..security import get_current_user
from ..serializers import notification_out

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(Notification).filter((Notification.user_id == user.id) | (Notification.user_id.is_(None))).order_by(Notification.created_at.desc()).limit(50).all()
    return [notification_out(row) for row in rows]
