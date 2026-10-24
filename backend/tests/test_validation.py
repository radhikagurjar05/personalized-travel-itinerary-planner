def test_generate_itinerary_invalid_dates(client):
    payload = {
        "destination": "Rome, Italy",
        "start_date": "2026-07-15",
        "end_date": "2026-07-10",  # Return before departure
        "budget": 1500,
        "currency": "EUR"
    }
    res = client.post("/api/itineraries/generate", json=payload)
    assert res.status_code == 422
    data = res.get_json()
    assert "details" in data


def test_generate_itinerary_zero_budget(client):
    payload = {
        "destination": "Kyoto, Japan",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "budget": 0,  # Zero budget not allowed
        "currency": "JPY"
    }
    res = client.post("/api/itineraries/generate", json=payload)
    assert res.status_code == 422


def test_generate_itinerary_excessive_duration(client):
    payload = {
        "destination": "Sydney, Australia",
        "start_date": "2026-01-01",
        "end_date": "2026-03-01",  # > 30 days
        "budget": 5000,
        "currency": "USD"
    }
    res = client.post("/api/itineraries/generate", json=payload)
    assert res.status_code == 422
    assert "30 days" in str(res.get_json())


def test_auth_invalid_email(client):
    res = client.post("/api/auth/register", json={
        "name": "Alex",
        "email": "not-an-email",
        "password": "validPassword123"
    })
    assert res.status_code == 422


def test_auth_short_password(client):
    res = client.post("/api/auth/register", json={
        "name": "Alex",
        "email": "alex@example.com",
        "password": "123"  # < 6 chars
    })
    assert res.status_code == 422
