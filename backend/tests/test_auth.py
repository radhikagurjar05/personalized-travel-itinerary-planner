def test_user_registration_and_login_flow(client):
    # Register
    reg_res = client.post("/api/auth/register", json={
        "name": "Radhika Gurjar",
        "email": "radhika@example.com",
        "password": "SecurePassword2026!"
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.get_json()
    assert "token" in reg_data
    assert reg_data["user"]["email"] == "radhika@example.com"

    # Duplicate registration
    dup_res = client.post("/api/auth/register", json={
        "name": "Radhika Duplicate",
        "email": "radhika@example.com",
        "password": "AnotherPassword123"
    })
    assert dup_res.status_code == 409

    # Valid Login
    login_res = client.post("/api/auth/login", json={
        "email": "radhika@example.com",
        "password": "SecurePassword2026!"
    })
    assert login_res.status_code == 200
    token = login_res.get_json()["token"]

    # Invalid password login
    bad_login = client.post("/api/auth/login", json={
        "email": "radhika@example.com",
        "password": "WrongPassword"
    })
    assert bad_login.status_code == 401

    # Check /api/auth/me with token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.get_json()["authenticated"] is True
    assert me_res.get_json()["user"]["name"] == "Radhika Gurjar"

    # Check /api/auth/me without token
    anon_res = client.get("/api/auth/me")
    assert anon_res.status_code == 200
    assert anon_res.get_json()["authenticated"] is False
