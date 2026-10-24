from flask import Blueprint, jsonify
from backend.database import db
from sqlalchemy import text

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def health_check():
    db_status = "connected"
    try:
        db.session.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)[:60]}"

    return jsonify({
        "status": "healthy" if "unhealthy" not in db_status else "degraded",
        "service": "TripGenius AI Backend",
        "version": "1.0.0",
        "database": db_status
    }), 200
