import json
from unittest.mock import MagicMock, patch
from backend.services.gemini_service import GeminiService, _clean_markdown_json

def test_clean_markdown_json():
    raw_markdown = '```json\n{"trip_title": "Test Paris"}\n```'
    cleaned = _clean_markdown_json(raw_markdown)
    assert cleaned == '{"trip_title": "Test Paris"}'

    raw_plain = '{"trip_title": "Test Rome"}'
    assert _clean_markdown_json(raw_plain) == raw_plain


def test_fallback_itinerary_generation():
    service = GeminiService(api_key="")
    params = {
        "destination": "Barcelona, Spain",
        "start_date": "2026-05-10",
        "end_date": "2026-05-14",
        "travelers_count": 2,
        "budget": 1800,
        "currency": "EUR",
        "travel_pace": "balanced",
        "travel_interests": ["Food", "Architecture"]
    }
    result = service.generate_itinerary(params)
    assert "Barcelona, Spain" in result["destination"]
    assert len(result["days"]) > 0
    assert "morning" in result["days"][0]
    assert "map_search_url" in result["days"][0]["morning"]
    assert result["budget_summary"]["currency"] == "EUR"


def test_mocked_gemini_api_call():
    mock_response_json = {
        "trip_title": "3 Days in Kyoto",
        "destination": "Kyoto, Japan",
        "overview": "Serene temples and bamboo groves.",
        "start_date": "2026-04-01",
        "end_date": "2026-04-03",
        "duration_days": 3,
        "travelers_count": 1,
        "travel_pace": "relaxed",
        "budget_summary": {
            "total_estimated_cost": 800,
            "currency": "USD",
            "accommodation_total": 400,
            "food_total": 250,
            "activities_total": 100,
            "transport_total": 50,
            "miscellaneous_total": 0,
            "cost_breakdown_note": "Based on standard estimates."
        },
        "days": [
            {
                "day_number": 1,
                "date": "2026-04-01",
                "theme": "Eastern Kyoto Temples",
                "estimated_daily_cost": 250,
                "morning": {
                    "time_slot": "Morning",
                    "attraction_name": "Kiyomizu-dera",
                    "description": "Historic wooden stage temple.",
                    "suggested_duration": "2.5 hours",
                    "estimated_cost": 10,
                    "map_search_url": "https://www.google.com/maps/search/?api=1&query=Kiyomizu-dera",
                    "tips": "Arrive early."
                },
                "afternoon": {
                    "time_slot": "Afternoon",
                    "attraction_name": "Gion District",
                    "description": "Preserved geisha district.",
                    "suggested_duration": "2 hours",
                    "estimated_cost": 0,
                    "map_search_url": "https://www.google.com/maps/search/?api=1&query=Gion",
                    "tips": "Be respectful of geiko."
                },
                "evening": {
                    "time_slot": "Evening",
                    "attraction_name": "Pontocho Alley",
                    "description": "Dining alley along the river.",
                    "suggested_duration": "2.5 hours",
                    "estimated_cost": 45,
                    "map_search_url": "https://www.google.com/maps/search/?api=1&query=Pontocho",
                    "tips": "Book riverside deck seats."
                },
                "meal_recommendations": {
                    "lunch": "Udon near Gion",
                    "dinner": "Kaiseki in Pontocho"
                },
                "rainy_day_alternative": "Kyoto National Museum",
                "route_optimization_tip": "Walking route connects all Day 1 spots."
            }
        ],
        "local_cuisine_recommendations": ["Matcha parfaits", "Yudofu"],
        "packing_suggestions": ["Comfortable slip-on shoes for temple floors"],
        "practical_tips": ["ICOCA card for transit"],
        "safety_and_accessibility": "Kyoto is very safe; cobblestones may be tricky for wheelchairs.",
        "assumptions_and_limitations": "Estimated costs do not include international flights."
    }

    service = GeminiService(api_key="fake-api-key")
    mock_client = MagicMock()
    mock_models = MagicMock()
    mock_client.models = mock_models

    mock_resp = MagicMock()
    mock_resp.text = f"```json\n{json.dumps(mock_response_json)}\n```"
    mock_models.generate_content.return_value = mock_resp

    service._client = mock_client

    params = {
        "destination": "Kyoto, Japan",
        "start_date": "2026-04-01",
        "end_date": "2026-04-03",
        "budget": 1000,
        "currency": "USD"
    }

    result = service.generate_itinerary(params)
    assert result["trip_title"] == "3 Days in Kyoto"
    assert len(result["days"]) == 1
    assert result["days"][0]["morning"]["attraction_name"] == "Kiyomizu-dera"
