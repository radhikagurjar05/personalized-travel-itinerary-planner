import uuid
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    itineraries = db.relationship("Itinerary", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Itinerary(db.Model):
    __tablename__ = "itineraries"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    title = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False, index=True)
    starting_city = db.Column(db.String(255), nullable=True)
    start_date = db.Column(db.String(50), nullable=False)
    end_date = db.Column(db.String(50), nullable=False)
    duration_days = db.Column(db.Integer, nullable=False, default=1)
    travelers_count = db.Column(db.Integer, nullable=False, default=1)
    budget = db.Column(db.Float, nullable=False, default=0.0)
    currency = db.Column(db.String(10), nullable=False, default="USD")
    travel_pace = db.Column(db.String(50), nullable=False, default="balanced")
    
    # Structured JSON fields
    interests = db.Column(db.JSON, nullable=True)
    preferences = db.Column(db.JSON, nullable=True)
    itinerary_data = db.Column(db.JSON, nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "destination": self.destination,
            "starting_city": self.starting_city,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "duration_days": self.duration_days,
            "travelers_count": self.travelers_count,
            "budget": self.budget,
            "currency": self.currency,
            "travel_pace": self.travel_pace,
            "interests": self.interests or [],
            "preferences": self.preferences or {},
            "itinerary_data": self.itinerary_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
