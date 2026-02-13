@echo off
setlocal

cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js/npm is not installed or not on PATH.
  echo Install Node.js from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting VOIDSPACE dev server...
start "VOIDSPACE Dev Server" cmd /k "cd /d ""%~dp0"" && npm run dev"

timeout /t 4 /nobreak >nul
start "" "http://localhost:3000/voidspace"

exit /b 0
