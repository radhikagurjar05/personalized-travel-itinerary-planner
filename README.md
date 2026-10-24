# TripGenius AI — Personalized Travel Itinerary Planner

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.3-black.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%202.5-4285F4.svg)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00e599.svg)](https://neon.tech/)
[![Deployment](https://img.shields.io/badge/Deploy-Render-46E3B7.svg)](https://render.com/)

---

## 1. Project Title & Overview
**TripGenius AI (Personalized Travel Itinerary Planner)** is a production-grade full-stack web application developed for the *Generative AI with Google Cloud* module. It transforms trip planning from hours of scattered research into an instant, personalized, and logically sequenced journey. By harnessing Google Cloud's **Gemini 2.5/2.0** generative models through the official `google-genai` Python SDK, TripGenius AI constructs day-by-day itineraries tailored to specific destinations, group sizes, travel dates, budgets, currencies, travel paces, and cultural interests.

---

## 2. Problem Statement
Planning travel today is overwhelming:
- Travelers consult dozens of tabs for flights, hotels, attractions, transport schedules, and local food guides.
- Generic online travel itineraries fail to consider individual budgets, travel paces, or dietary and mobility needs.
- Travelers frequently waste hours backtracking between attractions because activities are poorly sequenced geographically.
- Changes or unexpected rain ruin rigid static plans.

---

## 3. Objectives
1. **Autonomous Personalization**: Synthesize custom travel itineraries matching exact traveler criteria (budget, pace, dates, interests).
2. **Logistical Intelligence**: Sequence attractions geographically to minimize unnecessary transit times and provide real-time Google Maps links.
3. **Conversational Refinement**: Allow travelers to modify existing plans using natural language (e.g. *"Make this trip cheaper"*, *"Add more historical sights on day 2"*).
4. **Persistent Management & Export**: Allow users to save itineraries to Neon PostgreSQL, rename/manage trips, and download print-ready PDFs.
5. **Production Readiness**: Implement strict schema validation (Pydantic), comprehensive unit/integration test suites (pytest), secure authentication (JWT + PBKDF2), and automated deployment configs on Render.

---

## 4. Key Features
- **Intelligent Planning Form**: Validates dates, durations (up to 30 days), budgets, currencies (`USD`, `EUR`, `INR`, `GBP`, `JPY`, `AUD`, `CAD`), traveler count, and travel style.
- **Gemini AI Structured Output**: Guaranteed structured JSON schema providing:
  - Morning, afternoon, and evening activity slots.
  - Estimated attraction, dining, transit, and lodging costs.
  - Direct Google Maps query URLs for every sight.
  - Rainy-day and bad-weather alternatives.
  - Local cuisine recommendations and season-specific packing lists.
  - Transparent pricing disclaimer and feasibility notes.
- **Natural Language Refinement**: Chat-style AI modification engine that adapts existing itineraries on demand.
- **Interactive Dashboard**: Saved trips management (view, rename, delete with confirmation modal).
- **One-Click Export**: Export clean A4 PDF documents via client-side rendering or system print dialog.
- **User Authentication**: Secure user registration and login with PBKDF2 password hashing and JWT sessions. Seamless guest mode supported.

---

## 5. Technology Stack

| Domain | Technology | Version / Specification |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | React 19, TypeScript 5.x, Vite 8 |
| **Styling** | Tailwind CSS, Lucide Icons | Tailwind 3.4, Lucide React |
| **PDF Generation** | jsPDF, html2canvas | jsPDF 4.2, html2canvas 1.4 |
| **Backend API** | Python, Flask, Gunicorn | Python 3.11+, Flask 3.1.3, Gunicorn 26.2 |
| **Validation** | Pydantic v2 | Pydantic 2.14 |
| **AI / GenAI** | Google GenAI SDK | `google-genai` 2.33.0 (Gemini 2.5 Flash / 2.0 Flash) |
| **Database** | PostgreSQL on Neon | SQLAlchemy 2.0, psycopg2-binary 2.9, SSL Mode |
| **Authentication**| PyJWT, Werkzeug Security | PyJWT 2.15, PBKDF2 password hashing |
| **Testing** | Pytest, unittest.mock | Pytest 9.1.1 |
| **Hosting** | Render | Static Site (Frontend) + Web Service (Backend) |

---

## 6. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT TIER                                      |
|                                                                                   |
|   React 19 + TypeScript + Vite + Tailwind CSS                                     |
|   - Multi-step trip planner form with real-time validation                        |
|   - Dynamic day-by-day itinerary renderer with interactive map search links        |
|   - Natural language refinement chatbox                                           |
|   - Client-side PDF export (jsPDF + html2canvas) & print layout                   |
|   - Dashboard for saving, renaming, and deleting itineraries                      |
+-----------------------------------------+-----------------------------------------+
                                          |
                              HTTP/REST (JSON & JWT)
                                          |
+-----------------------------------------v-----------------------------------------+
|                                  SERVER TIER                                      |
|                                                                                   |
|   Python 3.11 / 3.13 Flask REST API + Gunicorn                                    |
|   - Flask-CORS origin protection                                                  |
|   - Pydantic v2 schemas for strict request/response validation                    |
|   - SQLAlchemy 2.0 ORM with PostgreSQL JSONB storage                              |
|   - JWT authentication & Werkzeug PBKDF2 password hashing                         |
+---------------------+-------------------------------------+-----------------------+
                      |                                     |
           Google GenAI Python SDK                    SQLAlchemy Engine
                      |                           (SSL Mode & Connection Pooling)
+---------------------v---------------------+         +-----v-----------------------+
|                 AI TIER                   |         |          DATA TIER          |
|                                           |         |                             |
|   Google Cloud Gemini 2.5 / 2.0           |         |   Neon Serverless PostgreSQL|
|   - Structured JSON mode                  |         |   - `users` table           |
|   - Geographic route sequencing           |         |   - `itineraries` table     |
|   - Conversational refinement engine      |         |     (indexed JSON payload)  |
+-------------------------------------------+         +-----------------------------+
```

---

## 7. Data Flow
1. **Input Submission**: The user configures their destination, dates, budget, pace, and interests on the frontend form.
2. **Backend Validation**: Flask receives the JSON payload; Pydantic validates date sequences (`end_date >= start_date`), positive budgets, and duration caps.
3. **Gemini Invocation**: `GeminiService` formats the prompt using the `google-genai` SDK with strict JSON schema instructions.
4. **Structured Response**: Gemini returns structured JSON; the service verifies attraction map URLs and returns the validated payload.
5. **Presentation & Refinement**: The frontend renders daily timeline cards. The user can refine via natural language (submitting to `/api/itineraries/refine`).
6. **Persistence**: The user clicks "Save Trip". The trip is persisted to the Neon PostgreSQL `itineraries` table.

---

## 8. Database Schema
For full details, see [`docs/database-schema.md`](docs/database-schema.md).

- **`users`**: `id` (PK), `name`, `email` (Unique Indexed), `password_hash`, `created_at`.
- **`itineraries`**: `id` (UUID PK), `user_id` (FK to `users.id`, nullable for guests), `title`, `destination` (Indexed), `starting_city`, `start_date`, `end_date`, `duration_days`, `travelers_count`, `budget`, `currency`, `travel_pace`, `interests` (JSON), `preferences` (JSON), `itinerary_data` (JSON), `created_at`, `updated_at`.

---

## 9. API Endpoint Documentation
For full details and examples, see [`docs/api.md`](docs/api.md).

- `GET /api/health` — Service health check & DB status.
- `POST /api/auth/register` — Register a new account.
- `POST /api/auth/login` — Login & receive JWT.
- `GET /api/auth/me` — Retrieve authenticated user profile.
- `POST /api/itineraries/generate` — Generate new itinerary via Gemini.
- `POST /api/itineraries/refine` — Revise itinerary with natural language.
- `GET /api/itineraries` — List saved itineraries.
- `GET /api/itineraries/<id>` — Retrieve a specific itinerary.
- `POST /api/itineraries` — Save itinerary to database.
- `PATCH /api/itineraries/<id>` — Update/rename itinerary.
- `DELETE /api/itineraries/<id>` — Delete itinerary.

---

## 10. Local Installation Instructions

### Prerequisites
- Python 3.11+ installed.
- Node.js 18+ and npm installed.
- Git installed.

### Clone the Repository
```bash
git clone https://github.com/radhikagurjar05/personalized-travel-itinerary-planner.git
cd personalized-travel-itinerary-planner
```

---

## 11. Virtual Environment Setup

### Windows (PowerShell)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### macOS / Linux (Bash)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 12. Frontend and Backend Startup Commands

### Start Backend
In terminal 1:
```bash
# Windows
.\venv\Scripts\python.exe -m backend.app

# Linux / Mac
python -m backend.app
```
Backend runs at `http://localhost:5000`.

### Start Frontend
In terminal 2:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 13. Google Gemini Credential Setup
1. Visit [Google AI Studio](https://aistudio.google.com/) or the Google Cloud Vertex AI Console.
2. Generate an API Key.
3. Add the key to your `.env` file:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
*(Note: If no key is configured, TripGenius AI automatically utilizes its built-in realistic fallback generator for seamless offline evaluation).*

---

## 14. Neon PostgreSQL Setup
1. Sign up at [Neon.tech](https://neon.tech/) and create a PostgreSQL project.
2. Copy the connection string (with pooled connection and `sslmode=require`).
3. Set in your `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
*(Note: If `DATABASE_URL` is omitted, the application uses local SQLite `sqlite:///tripgenius.db` automatically).*

---

## 15. Environment Variable Configuration

Copy the template:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini Model identifier | `gemini-2.5-flash` |
| `DATABASE_URL` | Neon PostgreSQL Connection URI | `postgresql://...@neon.tech/db?sslmode=require` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SECRET_KEY` | Flask and JWT secret signing key | Random 32+ character string |
| `FLASK_ENV` | Environment mode | `development` or `production` |
| `VITE_API_BASE_URL` | Backend URL for React | `http://localhost:5000` (or empty for proxy) |

---

## 16. Testing Instructions

Automated backend test suite verifies health endpoints, date boundary validation, budget bounds, mocked Gemini SDK calls, and CRUD operations:
```bash
# Windows
.\venv\Scripts\pytest.exe -v

# Linux / Mac
pytest -v
```

Frontend build & lint verification:
```bash
cd frontend
npm run lint
npm run build
```

---

## 17. GitHub Repository URL
**Repository**: [`https://github.com/radhikagurjar05/personalized-travel-itinerary-planner`](https://github.com/radhikagurjar05/personalized-travel-itinerary-planner)

---

## 18. Render Deployment Instructions

This repository includes a turnkey `render.yaml` blueprint.

1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint**.
3. Select `personalized-travel-itinerary-planner`.
4. Render will automatically configure:
   - **Backend Web Service**: `pip install -r requirements.txt` and `gunicorn backend.app:app`.
   - **Frontend Static Site**: `cd frontend && npm install && npm run build` publishing `frontend/dist`.
5. Under Environment Variables in the Render dashboard:
   - Paste your `DATABASE_URL` from Neon.
   - Paste your `GEMINI_API_KEY`.
   - Set `FRONTEND_URL` to your frontend Render URL.
   - Set `VITE_API_BASE_URL` to your backend Render URL.

---

## 19. Live Deployment URLs
- **Frontend Live App**: `https://personalized-travel-itinerary-planner.onrender.com`
- **Backend API**: `https://personalized-travel-itinerary-planner-api.onrender.com`

---

## 20. Limitations, Security Considerations & Future Roadmap

### Transparency & Limitations
- All estimated costs (lodging, dining, transit, entry fees) are algorithmic estimates based on historical trends and travel norms.
- TripGenius AI **does not book flights or hotel rooms**. Reservations and opening hours should be verified with official providers.

### Security Architecture
- **Secret Isolation**: Gemini API keys and database credentials reside strictly on the backend.
- **Password Security**: Passwords are never stored in plaintext and are salted using PBKDF2.
- **CORS Protection**: Access is restricted to trusted origins in production.

### Future Roadmap
- Integration with Google Flights & Google Hotels APIs for real-time live availability.
- Multi-user collaborative itinerary editing with WebSockets.
- Offline PWA caching with Service Workers.
- Export to Google Calendar (.ics format).

---
*Developed by Radhika Gurjar (`radhikagurjar05`) for Generative AI with Google Cloud.*
