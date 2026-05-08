@echo off
title Resolyn Phase-3 Backend
cd /d "%~dp0backend"
if not exist .venv\Scripts\python.exe (
  echo Creating Python virtual environment...
  py -m venv .venv || python -m venv .venv
)
call .venv\Scripts\activate.bat
echo Installing backend requirements...
python -m ensurepip --upgrade
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt --timeout 120 --retries 10
echo Starting FastAPI backend on http://localhost:8000
python -m uvicorn app.main:app --reload
pause
