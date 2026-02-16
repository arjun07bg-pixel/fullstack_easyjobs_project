@echo off
setlocal
echo ==========================================
echo    EasyJobs Full-Stack Starter
echo ==========================================
echo.

:: 1. Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/
    pause
    exit /b
)

:: 2. Fix Port 8000 (Kill existing processes)
echo [STEP 1/4] Clearing Port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Terminating old process %%a...
    taskkill /f /pid %%a >nul 2>&1
)
echo Port 8000 is now clean.

:: 3. Install/Update Dependencies
echo.
echo [STEP 2/4] Checking Python libraries...
python -m pip install -r requirements.txt
echo.

:: 4. Database Setup Check
echo [STEP 3/4] Initializing Database...
if not exist "easyjobs.db" (
    echo Creating fresh SQLite database...
)
echo.

:: 5. Start Server and Open Site
echo [STEP 4/4] Starting EasyJobs Backend...
echo.
echo ------------------------------------------
echo 📍 SERVER URL: http://127.0.0.1:8000
echo 📍 STATUS: Starting...
echo 📍 NOTE: Keep this window OPEN!
echo ------------------------------------------
echo.
timeout /t 3 /nobreak >nul
start http://127.0.0.1:8000
python -m uvicorn main:app --reload --port 8000 --host 127.0.0.1
echo ------------------------------------------

pause
endlocal
