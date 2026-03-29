@echo off
setlocal
chcp 65001 > nul

set PYTHONUTF8=1

cd C:\Repositories\MP-LogManager-new

echo Starting MP-LogManager...
python main.py

if %errorlevel% neq 0 (
    echo.
    echo Error occurred. Press any key to exit.
    pause > nul
)
endlocal
