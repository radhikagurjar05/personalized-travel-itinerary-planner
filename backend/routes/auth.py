import jwt
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from pydantic import ValidationError
from backend.database import db
from backend.models import User
from backend.schemas import UserRegisterRequest, UserLoginRequest

auth_bp = Blueprint("auth", __name__)

def format_validation_error(e: ValidationError):
    return [
        {
            "field": ".".join(str(p) for p in err.get("loc", [])),
            "message": err.get("msg", "Invalid value"),
            "type": err.get("type", "value_error")
        }
        for err in e.errors()
    ]

def create_jwt_token(user_id: int) -> str:
    secret = current_app.config["SECRET_KEY"]
    delta = current_app.config.get("JWT_EXPIRATION_DELTA", timedelta(days=7))
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + delta,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_jwt_token(token: str):
    secret = current_app.config["SECRET_KEY"]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError):
        return None


def get_current_user_from_request():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        user_id = decode_jwt_token(token)
        if user_id:
            return db.session.get(User, user_id)
    return None


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user_from_request()
        if not user:
            return jsonify({"error": "Unauthorized", "message": "Valid authentication token required"}), 401
        return f(user, *args, **kwargs)
    return decorated


@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True) or {}
        req = UserRegisterRequest(**data)
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "details": format_validation_error(e)}), 422
    except Exception as e:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON body"}), 400

    existing_user = User.query.filter_by(email=req.email).first()
    if existing_user:
        return jsonify({"error": "Conflict", "message": "An account with this email already exists"}), 409

    new_user = User(
        name=req.name.strip(),
        email=req.email
    )
    new_user.set_password(req.password)
    
    db.session.add(new_user)
    db.session.commit()

    token = create_jwt_token(new_user.id)
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": new_user.to_dict()
    }), 201


@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True) or {}
        req = UserLoginRequest(**data)
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "details": format_validation_error(e)}), 422
    except Exception:
        return jsonify({"error": "Bad Request", "message": "Invalid JSON body"}), 400

    user = User.query.filter_by(email=req.email).first()
    if not user or not user.check_password(req.password):
        return jsonify({"error": "Unauthorized", "message": "Invalid email or password"}), 401

    token = create_jwt_token(user.id)
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/api/auth/me", methods=["GET"])
def me():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"authenticated": False, "user": None}), 200

    return jsonify({
        "authenticated": True,
        "user": user.to_dict()
    }), 200
