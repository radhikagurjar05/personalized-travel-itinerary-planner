# API Reference — TripGenius AI

Base URL:
- Local: `http://localhost:5000`
- Production: `https://personalized-travel-itinerary-planner-api.onrender.com`

---

## 1. System Health

### `GET /api/health`
Checks backend service availability and database connectivity.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "TripGenius AI Backend",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 2. Authentication

### `POST /api/auth/register`
Creates a new user account with hashed password storage.

**Request Body**:
```json
{
  "name": "Radhika Gurjar",
  "email": "radhika@example.com",
  "password": "SecurePassword123!"
}
```

**Response `201 Created`**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Radhika Gurjar",
    "email": "radhika@example.com",
    "created_at": "2026-10-24T12:00:00Z"
  }
}
```

**Status Codes**:
- `201 Created`: User created successfully.
- `409 Conflict`: Account with this email already exists.
- `422 Unprocessable Entity`: Validation failure (e.g. invalid email or password < 6 chars).

---

### `POST /api/auth/login`
Authenticates an existing user and returns a signed JWT.

**Request Body**:
```json
{
  "email": "radhika@example.com",
  "password": "SecurePassword123!"
}
```

**Response `200 OK`**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Radhika Gurjar",
    "email": "radhika@example.com",
    "created_at": "2026-10-24T12:00:00Z"
  }
}
```

---

### `GET /api/auth/me`
Retrieves current authenticated profile from `Authorization: Bearer <token>`.

**Response `200 OK`**:
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "name": "Radhika Gurjar",
    "email": "radhika@example.com",
    "created_at": "2026-10-24T12:00:00Z"
  }
}
```

---

## 3. Itinerary Operations

### `POST /api/itineraries/generate`
Generates a structured day-by-day itinerary via Google Gemini.

**Request Body**:
```json
{
  "destination": "Kyoto, Japan",
  "starting_city": "Tokyo, Japan",
  "start_date": "2026-11-01",
  "end_date": "2026-11-04",
  "travelers_count": 2,
  "budget": 2000,
  "currency": "USD",
  "travel_interests": ["Historical places", "Food and local cuisine", "Culture and museums"],
  "travel_pace": "balanced",
  "accommodation_preference": "Balanced / Mid-range Hotel",
  "transportation_preference": "Public transit & walking",
  "dietary_requirements": "Vegetarian options preferred",
  "accessibility_requirements": "Avoid steep stair climbs where possible",
  "additional_preferences": "Love morning temple gardens"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "destination": "Kyoto, Japan",
  "data": {
    "trip_title": "4 Days in Kyoto: Temples, Gardens & Culinary Traditions",
    "destination": "Kyoto, Japan",
    "overview": "Detailed overview of the trip...",
    "start_date": "2026-11-01",
    "end_date": "2026-11-04",
    "duration_days": 4,
    "travelers_count": 2,
    "travel_pace": "balanced",
    "budget_summary": {
      "total_estimated_cost": 1700,
      "currency": "USD",
      "accommodation_total": 800,
      "food_total": 500,
      "activities_total": 240,
      "transport_total": 160,
      "miscellaneous_total": 0
    },
    "days": [
      {
        "day_number": 1,
        "date": "2026-11-01",
        "theme": "Historic Heart & Higashiyama Temples",
        "estimated_daily_cost": 420,
        "morning": {
          "time_slot": "Morning (9:00 AM - 12:30 PM)",
          "attraction_name": "Kiyomizu-dera Temple",
          "description": "Historic wooden stage with sweeping valley views...",
          "suggested_duration": "3 hours",
          "estimated_cost": 10,
          "map_search_url": "https://www.google.com/maps/search/?api=1&query=Kiyomizu-dera%2C+Kyoto",
          "tips": "Arrive early to beat tour groups."
        },
        "afternoon": { ... },
        "evening": { ... },
        "meal_recommendations": { ... },
        "rainy_day_alternative": "Kyoto National Museum & Crafts Gallery",
        "route_optimization_tip": "Walking path directly connects Kiyomizu-dera to Yasaka Shrine."
      }
    ],
    "local_cuisine_recommendations": [ ... ],
    "packing_suggestions": [ ... ],
    "practical_tips": [ ... ],
    "safety_and_accessibility": "...",
    "assumptions_and_limitations": "..."
  }
}
```

---

### `POST /api/itineraries/refine`
Modifies an existing itinerary with conversational natural language feedback.

**Request Body**:
```json
{
  "itinerary_id": "optional-uuid-of-saved-trip",
  "current_itinerary": { ... },
  "refinement_prompt": "Make this trip cheaper and add more vegetarian restaurant options",
  "original_request": { ... }
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": { ...revised_itinerary_object... }
}
```

---

### `GET /api/itineraries`
Lists all saved itineraries for the current session or user.

**Response `200 OK`**:
```json
{
  "count": 2,
  "itineraries": [
    {
      "id": "e3b0c442-98fc-1c14-9afb-4c72fe936279",
      "user_id": 1,
      "title": "Autumn Discovery in Kyoto",
      "destination": "Kyoto, Japan",
      "start_date": "2026-11-01",
      "end_date": "2026-11-04",
      "duration_days": 4,
      "travelers_count": 2,
      "budget": 1700.0,
      "currency": "USD",
      "travel_pace": "balanced",
      "created_at": "2026-10-24T12:30:00Z"
    }
  ]
}
```

---

### `GET /api/itineraries/<id>`
Retrieves complete saved itinerary details by UUID.

**Response `200 OK`**: Returns `{ "success": true, "itinerary": { ... } }`  
**Response `404 Not Found`**: Returns `{ "error": "Not Found", "message": "Itinerary not found" }`

---

### `POST /api/itineraries`
Saves a generated itinerary to persistent PostgreSQL storage.

---

### `PATCH /api/itineraries/<id>`
Renames a trip or updates its structured contents.

**Request Body**:
```json
{
  "title": "Royal Kyoto & Nara Excursion"
}
```

---

### `DELETE /api/itineraries/<id>`
Deletes a saved itinerary. Owner verification enforced if trip belongs to an authenticated user.
