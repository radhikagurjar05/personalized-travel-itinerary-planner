from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator

class GenerateItineraryRequest(BaseModel):
    destination: str = Field(..., min_length=2, max_length=200, description="Destination city, region, or country")
    starting_city: Optional[str] = Field(None, max_length=200, description="Departure location")
    start_date: str = Field(..., description="Departure date in YYYY-MM-DD")
    end_date: str = Field(..., description="Return date in YYYY-MM-DD")
    travelers_count: int = Field(1, ge=1, le=50, description="Number of travelers")
    budget: float = Field(..., gt=0, description="Total budget in selected currency")
    currency: str = Field("USD", min_length=3, max_length=5, description="Currency code (e.g. USD, EUR, INR, GBP)")
    travel_interests: List[str] = Field(default_factory=list, description="Selected travel interests")
    travel_pace: str = Field("balanced", description="Preferred travel pace: relaxed, balanced, packed")
    accommodation_preference: Optional[str] = Field("balanced/mid-range", description="Hostel, budget, mid-range, luxury")
    transportation_preference: Optional[str] = Field("public transit & walking", description="Rental car, public transit, walking, taxis")
    dietary_requirements: Optional[str] = Field(None, max_length=500, description="Dietary restrictions or preferences")
    accessibility_requirements: Optional[str] = Field(None, max_length=500, description="Mobility or accessibility requirements")
    additional_preferences: Optional[str] = Field(None, max_length=1000, description="Special requests or interests")

    @field_validator("travel_pace")
    @classmethod
    def validate_pace(cls, v: str) -> str:
        valid_paces = {"relaxed", "balanced", "packed"}
        if v.lower() not in valid_paces:
            return "balanced"
        return v.lower()

    @model_validator(mode="after")
    def validate_dates_and_duration(self):
        try:
            start = datetime.strptime(self.start_date, "%Y-%m-%d").date()
            end = datetime.strptime(self.end_date, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Dates must be valid in YYYY-MM-DD format.")

        if end < start:
            raise ValueError("Return date (end_date) cannot be before departure date (start_date).")

        duration = (end - start).days + 1
        if duration > 30:
            raise ValueError("Maximum trip duration for itinerary planning is 30 days.")

        return self


class RefineItineraryRequest(BaseModel):
    itinerary_id: Optional[str] = None
    current_itinerary: Dict[str, Any] = Field(..., description="The current structured itinerary JSON")
    refinement_prompt: str = Field(..., min_length=3, max_length=1000, description="Refinement instructions in natural language")
    original_request: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Original trip criteria")


class SaveItineraryRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    destination: str = Field(..., min_length=2, max_length=255)
    starting_city: Optional[str] = None
    start_date: str
    end_date: str
    duration_days: int = Field(1, ge=1)
    travelers_count: int = Field(1, ge=1)
    budget: float = Field(0.0, ge=0)
    currency: str = Field("USD", min_length=3, max_length=5)
    travel_pace: str = "balanced"
    interests: Optional[List[str]] = Field(default_factory=list)
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    itinerary_data: Dict[str, Any] = Field(..., description="Complete itinerary JSON")


class UpdateItineraryRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    itinerary_data: Optional[Dict[str, Any]] = None


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email format.")
        return v


class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()
