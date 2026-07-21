@echo off
echo ==========================================
echo Running TikTok Scraper Locally
echo ==========================================

:: Activate virtual environment
if exist "..\venv\Scripts\activate.bat" (
    call "..\venv\Scripts\activate.bat"
) else (
    echo Virtual environment not found. Please create it first.
    pause
    exit /b
)

:: Run migration to update RLS (just in case)
echo Updating database schema...
python migrate.py

:: Install Playwright Chromium if not exists
echo Checking Playwright browsers...
playwright install chromium

:: Run the scraper
echo Starting scraper...
python main.py

echo.
echo Process finished.
pause
