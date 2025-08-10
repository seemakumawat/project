#!/bin/bash

echo "Starting EduFace AI - Face Recognition Attendance System..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.7 or higher"
    exit 1
fi

# Check Python version
python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
required_version="3.7"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "Error: Python $python_version is installed, but Python $required_version or higher is required"
    exit 1
fi

# Check if required packages are installed
echo "Checking dependencies..."
python3 -c "import cv2, numpy, pandas, PIL, sklearn, tensorflow, mtcnn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing required packages..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install required packages"
        exit 1
    fi
fi

# Make sure directories exist
mkdir -p models training_data database

# Run the application
echo "Starting application..."
python3 main.py

if [ $? -ne 0 ]; then
    echo
    echo "Application exited with an error."
    read -p "Press Enter to continue..."
fi