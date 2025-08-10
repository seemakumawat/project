#!/usr/bin/env python3
"""
EduFace AI - Face Recognition Attendance System
Main entry point for the application
"""

import sys
import os
import tkinter as tk
from tkinter import messagebox

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from gui.main_window import MainApplication
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure all required packages are installed.")
    print("Run: pip install -r requirements.txt")
    sys.exit(1)

def check_dependencies():
    """Check if all required dependencies are available"""
    required_packages = [
        'cv2', 'numpy', 'pandas', 'PIL', 'sklearn', 'tensorflow', 'mtcnn'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'cv2':
                import cv2
            elif package == 'PIL':
                from PIL import Image
            else:
                __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        error_msg = f"Missing required packages: {', '.join(missing_packages)}\n"
        error_msg += "Please install them using: pip install -r requirements.txt"
        
        # Try to show GUI error if tkinter is available
        try:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Missing Dependencies", error_msg)
            root.destroy()
        except:
            print(error_msg)
        
        return False
    
    return True

def main():
    """Main function to start the application"""
    print("Starting EduFace AI - Face Recognition Attendance System...")
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    try:
        # Create main window
        root = tk.Tk()
        
        # Set window icon (if available)
        try:
            root.iconbitmap('assets/icon.ico')
        except:
            pass  # Icon file not found, continue without it
        
        # Create application
        app = MainApplication(root)
        
        # Start the GUI event loop
        root.mainloop()
        
    except Exception as e:
        error_msg = f"An error occurred while starting the application:\n{str(e)}"
        print(error_msg)
        
        try:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Application Error", error_msg)
            root.destroy()
        except:
            pass
        
        sys.exit(1)

if __name__ == "__main__":
    main()