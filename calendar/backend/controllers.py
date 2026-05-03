# backend/controllers.py
from sqlalchemy.orm import Session
from models import User, Event
import datetime

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, email: str):
    db_user = User(username=username, email=email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Event).offset(skip).limit(limit).all()

def get_events_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Event).filter(Event.owner_id == user_id).offset(skip).limit(limit).all()

def create_user_event(db: Session, event_data: dict, user_id: int):
    db_event = Event(**event_data, owner_id=user_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_event(db: Session, event_id: int):
    return db.query(Event).filter(Event.id == event_id).first()

def update_event(db: Session, event_id: int, event_data: dict):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if db_event:
        for key, value in event_data.items():
            setattr(db_event, key, value)
        db.commit()
        db.refresh(db_event)
    return db_event

def delete_event(db: Session, event_id: int):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event
