@echo off
title Resolyn Phase-3 Frontend
cd /d "%~dp0frontend"
echo Installing frontend packages...
npm install
echo Starting Vite frontend on http://localhost:5173
npm run dev
pause
