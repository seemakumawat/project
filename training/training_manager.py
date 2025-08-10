import os
import cv2
import numpy as np
from face_recognition.face_detector import FaceRecognitionSystem
import shutil
from datetime import datetime

class TrainingManager:
    def __init__(self, training_data_path="training_data"):
        self.training_data_path = training_data_path
        self.face_recognition = FaceRecognitionSystem()
        self.ensure_directories()
    
    def ensure_directories(self):
        """Ensure training directories exist"""
        os.makedirs(self.training_data_path, exist_ok=True)
        os.makedirs("models", exist_ok=True)
    
    def create_student_folder(self, student_id):
        """Create a folder for a student's training images"""
        student_folder = os.path.join(self.training_data_path, student_id)
        os.makedirs(student_folder, exist_ok=True)
        return student_folder
    
    def capture_training_images(self, student_id, num_images=30):
        """Capture training images for a student using webcam"""
        student_folder = self.create_student_folder(student_id)
        
        # Initialize webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return False, "Could not open webcam"
        
        captured_images = 0
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        print(f"Starting image capture for student {student_id}")
        print("Press SPACE to capture image, ESC to exit")
        
        while captured_images < num_images:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            # Draw rectangles around faces
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            # Display progress
            cv2.putText(frame, f"Captured: {captured_images}/{num_images}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, "Press SPACE to capture, ESC to exit", 
                       (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.imshow('Training Image Capture', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC key
                break
            elif key == 32 and len(faces) > 0:  # SPACE key and face detected
                # Save the image
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{student_id}_{captured_images+1}_{timestamp}.jpg"
                filepath = os.path.join(student_folder, filename)
                cv2.imwrite(filepath, frame)
                captured_images += 1
                print(f"Captured image {captured_images}/{num_images}")
        
        cap.release()
        cv2.destroyAllWindows()
        
        return captured_images > 0, f"Captured {captured_images} images"
    
    def load_training_images(self, student_id):
        """Load training images for a specific student"""
        student_folder = os.path.join(self.training_data_path, student_id)
        if not os.path.exists(student_folder):
            return []
        
        images = []
        for filename in os.listdir(student_folder):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                filepath = os.path.join(student_folder, filename)
                image = cv2.imread(filepath)
                if image is not None:
                    images.append(image)
        
        return images
    
    def extract_face_encodings_for_student(self, student_id):
        """Extract face encodings for all images of a student"""
        images = self.load_training_images(student_id)
        encodings = []
        
        for image in images:
            faces = self.face_recognition.detect_faces(image)
            for face_data in faces:
                encoding = self.face_recognition.extract_face_encoding(face_data['face'])
                if encoding is not None:
                    encodings.append(encoding)
        
        return encodings
    
    def train_system(self, progress_callback=None):
        """Train the face recognition system with all available data"""
        try:
            all_encodings = []
            all_labels = []
            
            # Get all student folders
            student_folders = [d for d in os.listdir(self.training_data_path) 
                             if os.path.isdir(os.path.join(self.training_data_path, d))]
            
            total_students = len(student_folders)
            
            for i, student_id in enumerate(student_folders):
                if progress_callback:
                    progress_callback(f"Processing {student_id}...", (i / total_students) * 100)
                
                encodings = self.extract_face_encodings_for_student(student_id)
                
                for encoding in encodings:
                    all_encodings.append(encoding)
                    all_labels.append(student_id)
            
            if len(all_encodings) == 0:
                return False, "No training data found"
            
            # Train the classifier
            if progress_callback:
                progress_callback("Training classifier...", 90)
            
            success = self.face_recognition.train_classifier(all_encodings, all_labels)
            
            if progress_callback:
                progress_callback("Training completed!", 100)
            
            if success:
                return True, f"Training completed successfully with {len(all_encodings)} face encodings from {total_students} students"
            else:
                return False, "Failed to train classifier"
                
        except Exception as e:
            return False, f"Training failed: {str(e)}"
    
    def get_training_statistics(self):
        """Get statistics about training data"""
        stats = {
            'total_students': 0,
            'total_images': 0,
            'students_data': {}
        }
        
        if not os.path.exists(self.training_data_path):
            return stats
        
        student_folders = [d for d in os.listdir(self.training_data_path) 
                         if os.path.isdir(os.path.join(self.training_data_path, d))]
        
        stats['total_students'] = len(student_folders)
        
        for student_id in student_folders:
            student_folder = os.path.join(self.training_data_path, student_id)
            image_files = [f for f in os.listdir(student_folder) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            image_count = len(image_files)
            stats['total_images'] += image_count
            stats['students_data'][student_id] = {
                'image_count': image_count,
                'folder_path': student_folder
            }
        
        return stats
    
    def delete_student_data(self, student_id):
        """Delete all training data for a student"""
        student_folder = os.path.join(self.training_data_path, student_id)
        if os.path.exists(student_folder):
            shutil.rmtree(student_folder)
            return True
        return False