import pytest
from backend.app import create_app
from backend.config import Config
from backend.database import db
from backend.models import User, Itinerary

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}
    SECRET_KEY = "test-secret-key-32-bytes-long-super-secure!"
    GEMINI_API_KEY = ""  # Test fallback mode by default
    WTF_CSRF_ENABLED = False

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def test_user(app):
    with app.app_context():
        user = User(name="Test Traveler", email="traveler@example.com")
        user.set_password("SecurePass123!")
        db.session.add(user)
        db.session.commit()
        return user.to_dict()

@pytest.fixture
def auth_headers(client, test_user):
    res = client.post("/api/auth/login", json={
        "email": "traveler@example.com",
        "password": "SecurePass123!"
    })
    token = res.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}
