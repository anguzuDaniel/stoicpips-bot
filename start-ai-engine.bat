@echo off
echo Starting Dunam AI Sentinel Engine on Port 8005...
cd /d "%~dp0"
python ai-engine/main.py
pause
