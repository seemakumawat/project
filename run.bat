@echo off
echo Starting EduFace AI - Face Recognition Attendance System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher from https://python.org
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import cv2, numpy, pandas, PIL, sklearn, tensorflow, mtcnn" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install required packages
        pause
        exit /b 1
    )
)

REM Run the application
echo Starting application...
python main.py

if errorlevel 1 (
    echo.
    echo Application exited with an error.
    pause
)