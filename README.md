# Resolyn Phase-3 Fullstack

AI-Based Citizen Grievance Classification System for hackathon demo.

## What is new in Phase-3

- Phase-3 AI Engine page in frontend
- Real AI-ready backend endpoints
- NLP civic complaint classification
- Smart priority score out of 100
- Duplicate complaint detection using text similarity + location/city clustering
- Fraud/spam complaint detection
- YOLOv8-ready image analysis adapter
- Whisper-ready voice-to-text adapter
- AI risk-zone prediction API
- Real-time Department Chat page
- Escalation automation engine
- Transparency timeline UI
- Notification simulation
- Existing Phase-2 features remain: auth, JWT, database, complaint form, tracking, map, admin dashboard, animal emergency, chatbot

> Note: YOLOv8 and Whisper are included as ready adapters for hackathon demo. The project runs without heavy model downloads. Later you can plug real `ultralytics` and `whisper/faster-whisper` models inside `backend/app/phase3_ai.py` and `backend/app/routers/ai.py`.

## Easiest Run Method on Windows

Open the project folder and double-click:

1. `START_BACKEND.bat`
2. `START_FRONTEND.bat`

Keep both windows open.

Backend: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`  
Frontend: `http://localhost:5173`

## Manual Run

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open:

```text
http://localhost:8000/docs
```

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo Logins

```text
Admin:
admin@resolyn.in
admin123

Citizen:
citizen@resolyn.in
citizen123

Department Officer:
officer@resolyn.in
officer123

NGO:
ngo@resolyn.in
ngo123
```

## Best Hackathon Demo Flow

1. Start backend and frontend.
2. Login as citizen.
3. Submit a complaint using text/location/image/voice.
4. Open Phase-3 AI Lab and run analysis.
5. Show category, department, priority score, duplicate risk, fraud risk and suggested actions.
6. Open Live Civic Map and show severity markers.
7. Track complaint by complaint number.
8. Login as admin and update complaint status.
9. Open Real-Time Hub, send officer-citizen message, and run escalation engine.
10. Show transparency timeline and notifications.

## Important Troubleshooting

Do not open `frontend/index.html` directly. Always run:

```powershell
npm run dev
```

If backend says `No module named uvicorn`, run:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

If `python` is not found, install Python and tick **Add Python to PATH** during installation.
