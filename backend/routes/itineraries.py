import logging
from flask import Blueprint, request, jsonify, current_app
from pydantic import ValidationError
from backend.database import db
from backend.models import Itinerary
from backend.schemas import (
    GenerateItineraryRequest, 
    RefineItineraryRequest, 
    SaveItineraryRequest, 
    UpdateItineraryRequest
)
from backend.services.gemini_service import GeminiService
from backend.routes.auth import get_current_user_from_request, format_validation_error

logger = logging.getLogger(__name__)
itineraries_bp = Blueprint("itineraries", __name__)

def get_gemini_service() -> GeminiService:
    api_key = current_app.config.get("GEMINI_API_KEY", "")
    model = current_app.config.get("GEMINI_MODEL", "gemini-2.5-flash")
    return GeminiService(api_key=api_key, model=model)


@itineraries_bp.route("/api/itineraries/generate", methods=["POST"])
def generate():
    """Generates a structured day-by-day itinerary via Gemini AI."""
    try:
        body = request.get_json(force=True) or {}
        req = GenerateItineraryRequest(**body)
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "details": format_validation_error(e)}), 422
    except Exception as e:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON body"}), 400

    service = get_gemini_service()
    try:
        itinerary_data = service.generate_itinerary(req.model_dump())
        return jsonify({
            "success": True,
            "destination": req.destination,
            "data": itinerary_data
        }), 200
    except Exception as e:
        logger.error("Itinerary generation error: %s", str(e), exc_info=True)
        return jsonify({
            "error": "AI Generation Failed",
            "message": "Unable to complete itinerary generation. Please try again."
        }), 500


@itineraries_bp.route("/api/itineraries/refine", methods=["POST"])
def refine():
    """Refines an existing itinerary using natural language feedback."""
    try:
        body = request.get_json(force=True) or {}
        req = RefineItineraryRequest(**body)
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "details": format_validation_error(e)}), 422
    except Exception:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON body"}), 400

    service = get_gemini_service()
    try:
        revised_data = service.refine_itinerary(
            current_itinerary=req.current_itinerary,
            refinement_prompt=req.refinement_prompt,
            original_request=req.original_request
        )

        # If itinerary exists in database, update it optionally
        if req.itinerary_id:
            existing = db.session.get(Itinerary, req.itinerary_id)
            if existing:
                existing.itinerary_data = revised_data
                if "trip_title" in revised_data:
                    existing.title = revised_data["trip_title"]
                db.session.commit()

        return jsonify({
            "success": True,
            "data": revised_data
        }), 200
    except Exception as e:
        logger.error("Itinerary refinement error: %s", str(e), exc_info=True)
        return jsonify({
            "error": "Refinement Failed",
            "message": str(e)
        }), 500


@itineraries_bp.route("/api/itineraries", methods=["GET"])
def list_itineraries():
    """Lists saved itineraries. If logged in, filters to user's trips."""
    user = get_current_user_from_request()
    
    query = Itinerary.query
    if user:
        query = query.filter_by(user_id=user.id)
    else:
        query = query.filter(Itinerary.user_id.is_(None))

    trips = query.order_by(Itinerary.created_at.desc()).all()
    return jsonify({
        "count": len(trips),
        "itineraries": [t.to_dict() for t in trips]
    }), 200


@itineraries_bp.route("/api/itineraries/<id>", methods=["GET"])
def get_itinerary(id: str):
    """Retrieves a specific itinerary by ID."""
    trip = db.session.get(Itinerary, id)
    if not trip:
        return jsonify({"error": "Not Found", "message": "Itinerary not found"}), 404

    return jsonify({
        "success": True,
        "itinerary": trip.to_dict()
    }), 200


@itineraries_bp.route("/api/itineraries", methods=["POST"])
def save_itinerary():
    """Saves a generated itinerary to the database."""
    try:
        body = request.get_json(force=True) or {}
        req = SaveItineraryRequest(**body)
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "details": format_validation_error(e)}), 422
    except Exception:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON body"}), 400

    user = get_current_user_from_request()

    new_trip = Itinerary(
        user_id=user.id if user else None,
        title=req.title,
        destination=req.destination,
        starting_city=req.starting_city,
        start_date=req.start_date,
        end_date=req.end_date,
        duration_days=req.duration_days,
        travelers_count=req.travelers_count,
        budget=req.budget,
        currency=req.currency,
        travel_pace=req.travel_pace,
        interests=req.interests,
        preferences=req.preferences,
        itinerary_data=req.itinerary_data
    )

    db.session.add(new_trip)
    db.session.commit()

    return jsonify({
        "message": "Itinerary saved successfully",
        "itinerary": new_trip.to_dict()
    }), 201


@itineraries_bp.route("/api/itineraries/<id>", methods=["PATCH"])
def update_itinerary(id: str):
    """Updates editable details like title or data of an itinerary."""
    trip = db.session.get(Itinerary, id)
    if not trip:
        return jsonify({"error": "Not Found", "message": "Itinerary not found"}), 404

    user = get_current_user_from_request()
    if trip.user_id and (not user or user.id != trip.user_id):
        return jsonify({"error": "Forbidden", "message": "You cannot edit another user's itinerary"}), 403

    try:
        body = request.get_json(force=True) or {}
        req = UpdateItineraryRequest(**body)
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "details": format_validation_error(e)}), 422
    except Exception:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON body"}), 400

    if req.title is not None:
        trip.title = req.title.strip()
    if req.itinerary_data is not None:
        trip.itinerary_data = req.itinerary_data

    db.session.commit()

    return jsonify({
        "message": "Itinerary updated successfully",
        "itinerary": trip.to_dict()
    }), 200


@itineraries_bp.route("/api/itineraries/<id>", methods=["DELETE"])
def delete_itinerary(id: str):
    """Deletes an itinerary with permission verification."""
    trip = db.session.get(Itinerary, id)
    if not trip:
        return jsonify({"error": "Not Found", "message": "Itinerary not found"}), 404

    user = get_current_user_from_request()
    if trip.user_id and (not user or user.id != trip.user_id):
        return jsonify({"error": "Forbidden", "message": "You cannot delete another user's itinerary"}), 403

    db.session.delete(trip)
    db.session.commit()

    return jsonify({
        "message": "Itinerary deleted successfully",
        "id": id
    }), 200
