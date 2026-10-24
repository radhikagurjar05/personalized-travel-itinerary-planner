import logging
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.database import db
from backend.routes.health import health_bp
from backend.routes.auth import auth_bp
from backend.routes.itineraries import itineraries_bp

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Configure CORS
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    if app.config.get("FRONTEND_URL"):
        fe_url = app.config["FRONTEND_URL"].rstrip("/")
        if fe_url not in allowed_origins:
            allowed_origins.append(fe_url)

    # In development or if wildcard is configured, allow all origins
    if app.config.get("FLASK_ENV") == "development" or "*" in allowed_origins:
        CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    else:
        CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(itineraries_bp)

    # Global Error Handlers
    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({"error": "Bad Request", "message": str(e)}), 400

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "Not Found", "message": "Requested resource was not found"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return jsonify({"error": "Method Not Allowed", "message": "The method is not allowed for the requested URL"}), 405

    @app.errorhandler(500)
    def handle_internal_error(e):
        app.logger.error("Unhandled internal server error: %s", str(e), exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred. Please try again later."}), 500

    # Initialize tables if needed
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables initialized successfully.")
        except Exception as e:
            app.logger.warning("Database create_all notice (may already exist or connecting to remote): %s", str(e))

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
