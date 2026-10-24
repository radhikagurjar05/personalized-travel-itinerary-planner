def test_generate_and_save_itinerary_flow(client):
    # 1. Generate itinerary
    gen_res = client.post("/api/itineraries/generate", json={
        "destination": "London, UK",
        "starting_city": "New York",
        "start_date": "2026-08-10",
        "end_date": "2026-08-13",
        "travelers_count": 2,
        "budget": 2500,
        "currency": "GBP",
        "travel_pace": "balanced",
        "travel_interests": ["Historical places", "Museums"]
    })
    assert gen_res.status_code == 200
    gen_data = gen_res.get_json()
    assert gen_data["success"] is True
    itinerary_data = gen_data["data"]

    # 2. Save itinerary
    save_res = client.post("/api/itineraries", json={
        "title": "Summer London Trip",
        "destination": "London, UK",
        "starting_city": "New York",
        "start_date": "2026-08-10",
        "end_date": "2026-08-13",
        "duration_days": 4,
        "travelers_count": 2,
        "budget": 2500,
        "currency": "GBP",
        "travel_pace": "balanced",
        "itinerary_data": itinerary_data
    })
    assert save_res.status_code == 201
    saved = save_res.get_json()["itinerary"]
    trip_id = saved["id"]
    assert trip_id is not None
    assert saved["title"] == "Summer London Trip"

    # 3. Retrieve single itinerary
    get_res = client.get(f"/api/itineraries/{trip_id}")
    assert get_res.status_code == 200
    assert get_res.get_json()["itinerary"]["destination"] == "London, UK"

    # 4. List itineraries
    list_res = client.get("/api/itineraries")
    assert list_res.status_code == 200
    assert list_res.get_json()["count"] >= 1

    # 5. Update itinerary title
    patch_res = client.patch(f"/api/itineraries/{trip_id}", json={
        "title": "Updated Royal London Tour"
    })
    assert patch_res.status_code == 200
    assert patch_res.get_json()["itinerary"]["title"] == "Updated Royal London Tour"

    # 6. Refine itinerary
    refine_res = client.post("/api/itineraries/refine", json={
        "itinerary_id": trip_id,
        "current_itinerary": itinerary_data,
        "refinement_prompt": "Make this trip more budget-friendly with free museums"
    })
    assert refine_res.status_code == 200
    assert refine_res.get_json()["success"] is True

    # 7. Delete itinerary
    del_res = client.delete(f"/api/itineraries/{trip_id}")
    assert del_res.status_code == 200

    # 8. Verify deletion
    verify_res = client.get(f"/api/itineraries/{trip_id}")
    assert verify_res.status_code == 404
