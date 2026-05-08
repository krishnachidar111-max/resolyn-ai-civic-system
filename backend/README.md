# Resolyn Phase-3 Backend

FastAPI backend with JWT authentication, SQLite database, complaint APIs, admin APIs and Phase-3 AI-ready services.

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`.

## New Phase-3 API Endpoints

- `GET /api/ai/model-status`
- `POST /api/ai/analyze-text`
- `POST /api/ai/analyze-image`
- `POST /api/ai/transcribe-voice`
- `POST /api/ai/full-pipeline`
- `GET /api/ai/risk-zones`
- `GET /api/chat/{complaint_no}`
- `POST /api/chat/{complaint_no}`
- `GET /api/escalations`
- `POST /api/escalations/run`
