from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os, sys

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database.database import get_db
from models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ── GET all notifications for a user ──────────────────────────
@router.get("/user/{user_id}")
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Notification)\
        .filter(Notification.user_id == user_id)\
        .order_by(Notification.created_at.desc())\
        .limit(50)\
        .all()


# ── GET unread count for a user ────────────────────────────────
@router.get("/user/{user_id}/unread-count")
def get_unread_count(user_id: int, db: Session = Depends(get_db)):
    count = db.query(Notification)\
        .filter(Notification.user_id == user_id, Notification.is_read == False)\
        .count()
    return {"unread_count": count}


# ── CREATE a notification ──────────────────────────────────────
@router.post("/")
def create_notification(data: dict, db: Session = Depends(get_db)):
    notif = Notification(
        user_id=data["user_id"],
        title=data.get("title", "Notification"),
        message=data.get("message", ""),
        type=data.get("type", "info")
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


# ── MARK notification as read ──────────────────────────────────
@router.patch("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"detail": "Marked as read"}


# ── MARK ALL as read for user ──────────────────────────────────
@router.patch("/user/{user_id}/read-all")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    db.query(Notification)\
        .filter(Notification.user_id == user_id, Notification.is_read == False)\
        .update({"is_read": True})
    db.commit()
    return {"detail": "All notifications marked as read"}


# ── DELETE a notification ──────────────────────────────────────
@router.delete("/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"detail": "Deleted"}
