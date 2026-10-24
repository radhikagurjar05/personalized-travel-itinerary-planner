import json
import logging
import re
import urllib.parse
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are TripGenius AI, an expert travel planner and itinerary designer.
You create detailed, realistic, culturally-rich, and logically-sequenced travel itineraries.

CRITICAL INSTRUCTIONS:
1. Output MUST be ONLY valid JSON adhering strictly to the schema provided. Do not wrap with conversational filler.
2. Clearly label all prices, travel times, and costs as estimates. Do NOT claim flights or hotels are booked or verified.
3. Group activities logically by location to minimize travel time between attractions.
4. Provide morning, afternoon, and evening slots for each day.
5. Provide actionable alternative activities for rain, bad weather, or unexpected closures.
6. Provide helpful Google Maps search query URLs for key attractions.
7. Respect the specified budget, pace, traveler count, dietary restrictions, and accessibility needs.
"""

ITINERARY_JSON_SCHEMA_DESCRIPTION = """
JSON Structure:
{
  "trip_title": "string (e.g. 5 Days in Tokyo: Cultural Wonders & Modern Marvels)",
  "destination": "string",
  "overview": "string (engaging 2-3 paragraph overview)",
  "start_date": "string",
  "end_date": "string",
  "duration_days": integer,
  "travelers_count": integer,
  "travel_pace": "relaxed | balanced | packed",
  "budget_summary": {
    "total_estimated_cost": number,
    "currency": "string",
    "accommodation_total": number,
    "food_total": number,
    "activities_total": number,
    "transport_total": number,
    "miscellaneous_total": number,
    "cost_breakdown_note": "string explaining estimates and assumptions"
  },
  "days": [
    {
      "day_number": integer,
      "date": "string",
      "theme": "string (e.g. Historic Temples and Vibrant Street Food)",
      "estimated_daily_cost": number,
      "morning": {
        "time_slot": "Morning (9:00 AM - 12:30 PM)",
        "attraction_name": "string",
        "description": "string",
        "suggested_duration": "string",
        "estimated_cost": number,
        "map_search_url": "string (https://www.google.com/maps/search/?api=1&query=...)",
        "tips": "string"
      },
      "afternoon": {
        "time_slot": "Afternoon (1:00 PM - 5:00 PM)",
        "attraction_name": "string",
        "description": "string",
        "suggested_duration": "string",
        "estimated_cost": number,
        "map_search_url": "string",
        "tips": "string"
      },
      "evening": {
        "time_slot": "Evening (6:00 PM - 9:30 PM)",
        "attraction_name": "string",
        "description": "string",
        "suggested_duration": "string",
        "estimated_cost": number,
        "map_search_url": "string",
        "tips": "string"
      },
      "meal_recommendations": {
        "lunch": "string (restaurant or dish idea with local vibe)",
        "dinner": "string (restaurant or dish idea with local vibe)"
      },
      "rainy_day_alternative": "string (indoor museum, market, or cultural center alternative)",
      "route_optimization_tip": "string (walking/transit tips to avoid backtracking)"
    }
  ],
  "local_cuisine_recommendations": ["list of must-try dishes and foodie hotspots"],
  "packing_suggestions": ["season and activity-specific packing items"],
  "practical_tips": ["currency/payment tips, transit passes, cultural etiquette"],
  "safety_and_accessibility": "string (emergency numbers, accessibility notes, dietary guidelines)",
  "assumptions_and_limitations": "string (clear disclaimer on estimated prices and schedule feasibility)"
}
"""


def _generate_map_url(query: str, destination: str) -> str:
    cleaned = f"{query}, {destination}".strip()
    return f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(cleaned)}"


def _clean_markdown_json(text: str) -> str:
    """Strips ```json ... ``` code fences if present."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _build_fallback_itinerary(params: Dict[str, Any]) -> Dict[str, Any]:
    """Provides a rich, realistic fallback itinerary if Gemini API key is missing or fails."""
    dest = params.get("destination", "Paris, France")
    start = params.get("start_date", "2026-06-01")
    end = params.get("end_date", "2026-06-04")
    travelers = params.get("travelers_count", 2)
    budget = params.get("budget", 2000)
    currency = params.get("currency", "USD")
    pace = params.get("travel_pace", "balanced")
    interests = params.get("travel_interests", ["Culture", "Food", "Sightseeing"])

    return {
        "trip_title": f"Discovery Journey to {dest}",
        "destination": dest,
        "overview": (
            f"Welcome to your personalized itinerary for {dest}! Designed for {travelers} traveler(s) "
            f"with a {pace} pace and a focus on {', '.join(interests) if interests else 'local culture'}. "
            f"This plan balances iconic landmarks with authentic neighborhoods, minimizing transit fatigue while "
            f"maximizing memorable culinary and cultural experiences."
        ),
        "start_date": start,
        "end_date": end,
        "duration_days": 3,
        "travelers_count": travelers,
        "travel_pace": pace,
        "budget_summary": {
            "total_estimated_cost": round(budget * 0.85, 2),
            "currency": currency,
            "accommodation_total": round(budget * 0.40, 2),
            "food_total": round(budget * 0.25, 2),
            "activities_total": round(budget * 0.12, 2),
            "transport_total": round(budget * 0.08, 2),
            "miscellaneous_total": round(budget * 0.05, 2),
            "cost_breakdown_note": "All costs are estimates based on standard season travel and mid-range choices."
        },
        "days": [
            {
                "day_number": 1,
                "date": start,
                "theme": "Arrival, Iconic Highlights & Sunset Views",
                "estimated_daily_cost": round(budget * 0.25, 2),
                "morning": {
                    "time_slot": "Morning (9:30 AM - 12:30 PM)",
                    "attraction_name": f"{dest} Historic Old Quarter & Central Square",
                    "description": "Stroll through the architectural core of the city, soak in the morning energy, and photograph key civic monuments.",
                    "suggested_duration": "3 hours",
                    "estimated_cost": 15.0,
                    "map_search_url": _generate_map_url("Central Historic Square", dest),
                    "tips": "Early morning light provides great photo opportunities before midday crowds gather."
                },
                "afternoon": {
                    "time_slot": "Afternoon (1:30 PM - 5:00 PM)",
                    "attraction_name": f"{dest} Premier Cultural Museum & Gardens",
                    "description": "Explore the signature artistic exhibits and historic collections, followed by a calm walk through adjacent landscaped gardens.",
                    "suggested_duration": "3.5 hours",
                    "estimated_cost": 25.0,
                    "map_search_url": _generate_map_url("National Museum", dest),
                    "tips": "Book tickets online in advance to skip ticket counter lines."
                },
                "evening": {
                    "time_slot": "Evening (6:30 PM - 9:30 PM)",
                    "attraction_name": "Panoramic City Overlook & Waterfront Promenade",
                    "description": "Watch twilight envelop the skyline from a scenic vantage point, followed by dinner at a bustling riverside bistro.",
                    "suggested_duration": "3 hours",
                    "estimated_cost": 40.0,
                    "map_search_url": _generate_map_url("Scenic Waterfront Promenade", dest),
                    "tips": "Reserve a window or patio table for optimal twilight ambiance."
                },
                "meal_recommendations": {
                    "lunch": "Artisan cafe serving fresh sourdough sandwiches and local pastries.",
                    "dinner": "Traditional bistro known for regional comfort stews and local pairings."
                },
                "rainy_day_alternative": "Explore indoor covered arcades, antique passages, or the city science pavilion.",
                "route_optimization_tip": "All Day 1 locations are within a 15-minute transit or walking corridor."
            },
            {
                "day_number": 2,
                "date": "Day 2",
                "theme": "Deep Cultural Immersion & Artisan Markets",
                "estimated_daily_cost": round(budget * 0.30, 2),
                "morning": {
                    "time_slot": "Morning (9:00 AM - 12:00 PM)",
                    "attraction_name": "Famous Local Farmers & Spice Bazaar",
                    "description": "Experience local market culture, sample freshly prepared bites, and interact with regional growers and artisans.",
                    "suggested_duration": "3 hours",
                    "estimated_cost": 20.0,
                    "map_search_url": _generate_map_url("Central Market Bazaar", dest),
                    "tips": "Bring a reusable tote bag and small local currency denominations."
                },
                "afternoon": {
                    "time_slot": "Afternoon (1:00 PM - 4:30 PM)",
                    "attraction_name": "Botanical Conservatories & Creative District",
                    "description": "Wander through exotic glasshouses, outdoor sculpture gardens, and surrounding boutique craft studios.",
                    "suggested_duration": "3.5 hours",
                    "estimated_cost": 18.0,
                    "map_search_url": _generate_map_url("Botanical Gardens", dest),
                    "tips": "Wear comfortable walking shoes suitable for gravel pathways."
                },
                "evening": {
                    "time_slot": "Evening (6:00 PM - 9:30 PM)",
                    "attraction_name": "Lantern-Lit Night Market & Street Food Safari",
                    "description": "Delight your palate with authentic street foods, night bazaar stalls, and lively street performances.",
                    "suggested_duration": "3.5 hours",
                    "estimated_cost": 30.0,
                    "map_search_url": _generate_map_url("Night Market", dest),
                    "tips": "Follow stalls with long local queues for guaranteed freshness."
                },
                "meal_recommendations": {
                    "lunch": "Market stall serving specialty noodles or savory baked pies.",
                    "dinner": "Atmospheric courtyard dining offering family-style tapas and sharing platters."
                },
                "rainy_day_alternative": "Visit the modern interactive art museum and an indoor culinary food hall.",
                "route_optimization_tip": "Take the metro direct line between morning market and afternoon gardens."
            },
            {
                "day_number": 3,
                "date": end,
                "theme": "Hidden Gems, Panorama & Farewell Dinner",
                "estimated_daily_cost": round(budget * 0.30, 2),
                "morning": {
                    "time_slot": "Morning (9:30 AM - 12:30 PM)",
                    "attraction_name": "Hilltop Fortress or Historic Castle",
                    "description": "Ascend to the historic bastion commanding 360-degree vistas across the province.",
                    "suggested_duration": "3 hours",
                    "estimated_cost": 22.0,
                    "map_search_url": _generate_map_url("Historic Castle Lookout", dest),
                    "tips": "Funicular or tram is available if you prefer to avoid the steep stairs."
                },
                "afternoon": {
                    "time_slot": "Afternoon (1:30 PM - 4:30 PM)",
                    "attraction_name": "Artisan Quarter & Souvenir Shopping",
                    "description": "Browse independent ceramic studios, leather goods, and local gourmet confectioneries.",
                    "suggested_duration": "3 hours",
                    "estimated_cost": 35.0,
                    "map_search_url": _generate_map_url("Artisan Craft District", dest),
                    "tips": "Check duty-free customs allowances if purchasing specialty goods."
                },
                "evening": {
                    "time_slot": "Evening (6:30 PM - 10:00 PM)",
                    "attraction_name": "Farewell Rooftop Dinner & Skyline Illuminations",
                    "description": "Celebrate the culmination of your journey with a memorable culinary experience overlooking the illuminated city.",
                    "suggested_duration": "3.5 hours",
                    "estimated_cost": 55.0,
                    "map_search_url": _generate_map_url("Rooftop View Restaurant", dest),
                    "tips": "Smart-casual attire recommended for rooftop venues."
                },
                "meal_recommendations": {
                    "lunch": "Quiet garden cafe serving fresh salads and local flatbreads.",
                    "dinner": "Signature fine-casual restaurant highlighting seasonal harvest ingredients."
                },
                "rainy_day_alternative": "Underground historical crypts tour or hands-on pottery / cooking workshop.",
                "route_optimization_tip": "Keep luggage stored at hotel or station lockers prior to the hilltop excursion."
            }
        ],
        "local_cuisine_recommendations": [
            "Signature regional specialties and slow-simmered dishes",
            "Artisanal breads, cheeses, and morning bakeries",
            "Locally-brewed coffees, herbal infusions, and craft beverages",
            "Seasonal fruit tarts and traditional desserts"
        ],
        "packing_suggestions": [
            "Comfortable, broken-in walking shoes",
            "Universal power adapter and high-capacity portable power bank",
            "Weather-appropriate layering (light windbreaker / compact umbrella)",
            "Daypack or crossbody bag with anti-theft zipper closures",
            "Reusable water bottle"
        ],
        "practical_tips": [
            "Most venues accept contactless card payments, but carry a small amount of cash for markets.",
            "Purchase a multi-day unlimited public transit card at the airport or main rail station.",
            "Tipping customs: check local standards; 5-10% is customary for attentive table service."
        ],
        "safety_and_accessibility": (
            "Keep emergency contacts and your hotel address card handy in local language. "
            "Major transit hubs provide step-free elevators and accessible carriages."
        ),
        "assumptions_and_limitations": (
            "Estimated expenses do not include long-haul airfare. Prices and opening hours fluctuate seasonally. "
            "Verify attraction reservations and transit schedules directly before arrival."
        )
    }


class GeminiService:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or ""
        self.model = model or "gemini-2.5-flash"
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info("Initialized Google GenAI client successfully with model: %s", self.model)
            except Exception as e:
                logger.warning("Could not initialize google-genai client: %s", str(e))

    def generate_itinerary(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generates a structured itinerary via Gemini 2.5/2.0 or provides graceful fallback."""
        if not self._client or not self.api_key:
            logger.info("Gemini API key not configured or client unavailable. Using structured fallback.")
            return _build_fallback_itinerary(params)

        prompt = f"""
Create a comprehensive, custom day-by-day travel itinerary with the following parameters:

- Destination: {params.get('destination')}
- Departure Location: {params.get('starting_city', 'Not specified')}
- Start Date: {params.get('start_date')}
- End Date: {params.get('end_date')}
- Number of Travelers: {params.get('travelers_count', 1)}
- Total Budget: {params.get('budget')} {params.get('currency', 'USD')}
- Travel Pace: {params.get('travel_pace', 'balanced')}
- Travel Interests: {', '.join(params.get('travel_interests', []))}
- Accommodation Style: {params.get('accommodation_preference', 'mid-range')}
- Preferred Transport: {params.get('transportation_preference', 'public transit & walking')}
- Dietary Needs: {params.get('dietary_requirements', 'None')}
- Accessibility Needs: {params.get('accessibility_requirements', 'Standard')}
- Additional Notes: {params.get('additional_preferences', 'None')}

Please adhere strictly to this schema:
{ITINERARY_JSON_SCHEMA_DESCRIPTION}
"""
        try:
            from google.genai import types
            
            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )

            if not response or not response.text:
                raise ValueError("Empty response received from Gemini model.")

            cleaned = _clean_markdown_json(response.text)
            parsed_json = json.loads(cleaned)

            # Ensure map URLs exist for morning/afternoon/evening
            destination = params.get("destination", "")
            if "days" in parsed_json and isinstance(parsed_json["days"], list):
                for day in parsed_json["days"]:
                    for slot in ["morning", "afternoon", "evening"]:
                        if slot in day and isinstance(day[slot], dict):
                            if not day[slot].get("map_search_url"):
                                attr_name = day[slot].get("attraction_name", destination)
                                day[slot]["map_search_url"] = _generate_map_url(attr_name, destination)

            return parsed_json

        except Exception as e:
            logger.error("Gemini generation failed: %s. Reverting to fallback itinerary.", str(e))
            fallback = _build_fallback_itinerary(params)
            fallback["assumptions_and_limitations"] += f" (Note: AI service error encountered: {str(e)[:100]}. Fallback template provided.)"
            return fallback

    def refine_itinerary(
        self, 
        current_itinerary: Dict[str, Any], 
        refinement_prompt: str, 
        original_request: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Refines an existing itinerary based on natural language instructions from the user."""
        if not self._client or not self.api_key:
            logger.info("Gemini API key not configured. Performing simulated refinement.")
            # Clone and annotate current itinerary
            updated = json.loads(json.dumps(current_itinerary))
            updated["trip_title"] = f"{updated.get('trip_title', 'Trip')} (Updated: {refinement_prompt[:30]})"
            updated["overview"] += f" [Refinement applied: '{refinement_prompt}']"
            return updated

        refine_instruction = f"""
Here is an existing travel itinerary JSON:
{json.dumps(current_itinerary)}

The user has requested the following modification:
"{refinement_prompt}"

INSTRUCTIONS:
1. Update the itinerary to incorporate the user's request precisely (e.g. adjust budget, replace activities, change pace, add dietary accommodations, etc.).
2. Maintain the exact same JSON schema structure as the input.
3. Keep all unchanged days/activities coherent and realistic.
4. Return ONLY valid JSON.
"""
        try:
            from google.genai import types

            response = self._client.models.generate_content(
                model=self.model,
                contents=refine_instruction,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.5,
                    response_mime_type="application/json"
                )
            )

            if not response or not response.text:
                raise ValueError("Empty response received during refinement.")

            cleaned = _clean_markdown_json(response.text)
            parsed_json = json.loads(cleaned)
            return parsed_json

        except Exception as e:
            logger.error("Gemini refinement failed: %s", str(e))
            raise RuntimeError(f"Unable to refine itinerary: {str(e)}")
