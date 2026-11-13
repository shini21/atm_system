@echo off
title APEX BANK - Full-Stack ATM Application Launcher
echo ========================================================
echo        STARTING APEX BANK FULL-STACK ATM SYSTEM
echo ========================================================
echo.
echo 1. Launching Spring Boot Backend (Port 8080)...
start "APEX ATM - Backend" cmd /k ".\mvnw.cmd compile spring-boot:run"

echo 2. Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo 3. Launching React Touchscreen Frontend (Port 5173)...
start "APEX ATM - Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ========================================================
echo Both servers launched! Opening browser...
echo ========================================================
timeout /t 3 /nobreak >nul
start http://localhost:5173

