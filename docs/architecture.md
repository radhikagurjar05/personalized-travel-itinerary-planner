# System Architecture — TripGenius AI

## Overview
TripGenius AI is a cloud-native, decoupled web application engineered for autonomous, personalized travel itinerary planning using Google Cloud Gemini Generative AI, Flask, PostgreSQL (hosted on Neon), and React with TypeScript and Vite.

```
+-------------------------------------------------------------------------------+
|                                  CLIENT TIER                                  |
|                                                                               |
|   React 19 + TypeScript + Vite + Tailwind CSS + Lucide React                  |
|   - Multi-step trip planner form with real-time validation                    |
|   - Dynamic day-by-day itinerary renderer with interactive map search links    |
|   - Natural language refinement chatbox                                       |
|   - Client-side PDF export (jsPDF + html2canvas) & print layout               |
|   - Dashboard for saving, renaming, and deleting itineraries                  |
+---------------------------------------+---------------------------------------+
                                        |
                            HTTP/REST (JSON & JWT)
                                        |
+---------------------------------------v---------------------------------------+
|                                  SERVER TIER                                  |
|                                                                               |
|   Python 3.11 / 3.13 Flask REST API + Gunicorn                                |
|   - Flask-CORS origin protection                                              |
|   - Pydantic v2 schemas for strict request/response validation                |
|   - SQLAlchemy 2.0 ORM with PostgreSQL JSONB storage                          |
|   - JWT authentication & Werkzeug PBKDF2 password hashing                     |
+-------------------+-----------------------------------+-----------------------+
                    |                                   |
         Google GenAI Python SDK                  SQLAlchemy Engine
                    |                         (SSL Mode & Connection Pooling)
+-------------------v-------------------+       +-------v-----------------------+
|               AI TIER                 |       |           DATA TIER           |
|                                       |       |                               |
|   Google Cloud Gemini 2.5 / 2.0       |       |   Neon Serverless PostgreSQL  |
|   - Structured JSON mode              |       |   - `users` table             |
|   - Geographic route sequencing       |       |   - `itineraries` table       |
|   - Conversational refinement engine  |       |     (indexed JSON payload)    |
+---------------------------------------+       +-------------------------------+
```

## Detailed Component Responsibilities

### 1. Presentation Tier (Frontend)
- **Framework**: Vite + React 19 + TypeScript.
- **Routing**: Client-side routing with `react-router-dom` v7 with `_redirects` fallback for zero 404s on page refresh in static hosting.
- **Styling**: Tailwind CSS with custom brand palette (`brand` emeralds, `ocean` blues), accessible contrast, print media rules, and micro-interactions.
- **State Management**: React state hooks (`useState`, `useEffect`) and URL search params for bookmarkable itineraries (`/itinerary?id=<uuid>`).
- **Security**: All API calls route through backend endpoints. No client-side Google API keys are exposed.

### 2. Application Tier (Backend)
- **Framework**: Flask 3.1 with blueprint modularity (`health_bp`, `auth_bp`, `itineraries_bp`).
- **Data Validation**: Pydantic v2 validates:
  - Date format (`YYYY-MM-DD`) and date ordering (`end_date >= start_date`).
  - Duration limits (enforcing maximum 30 days to avoid prompt overflows).
  - Positive numeric budgets and traveler bounds.
  - Sanitized strings and valid email structures.
- **Authentication**: Stateless JSON Web Tokens (JWT) using HS256 algorithm with 7-day expiration. Passwords hashed using PBKDF2 via `werkzeug.security`.
- **CORS Handling**: Dynamic origin resolution reading `FRONTEND_URL` in production and localhost in development.

### 3. Generative AI Engine
- **SDK**: Official `google-genai` Python SDK (`from google import genai`).
- **Prompt Architecture**: Strict system instructions requiring pure JSON responses matching the trip schema (morning, afternoon, evening slots, budget breakdowns, packing recommendations, map query links, and rain alternatives).
- **Refinement Strategy**: Contextual injection of the previous itinerary state and targeted user instruction, allowing targeted adjustments without losing unchanged day context.
- **Resilience**: Comprehensive fallback generator ensuring that temporary upstream quota limits or missing API keys never break application functionality.

### 4. Persistence Tier (Neon PostgreSQL)
- **Database**: Serverless PostgreSQL on Neon with SSL connection (`sslmode=require`).
- **Connection Management**: SQLAlchemy connection pool pre-pinging (`pool_pre_ping=True`) and connection recycling (`pool_recycle=300`) to handle serverless cold starts.
- **Local Fallback**: Automatic SQLite fallback when `DATABASE_URL` is omitted, allowing offline testing and immediate local setup.
