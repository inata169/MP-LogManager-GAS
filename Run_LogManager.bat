@echo off
setlocal
chcp 65001 > nul

set PYTHONUTF8=1

cd /d "%~dp0"

echo [1/3] Syncing data with GitHub (Mobile Sync)...
python sync_json.py --import

echo.
echo [2/3] Starting MP-LogManager...
python main.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Application exited with error.
    pause
) else (
    echo.
    echo [3/3] Syncing final changes to GitHub...
    python sync_json.py --export
    echo.
    echo [DONE] All synced.
    timeout /t 3
)
endlocal
