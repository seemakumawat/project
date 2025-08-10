import cv2 # type: ignore
import numpy as np
from mtcnn import MTCNN # type: ignore
import tensorflow as tf # type: ignore
from tensorflow.keras.models import load_model # type: ignore
import os
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
import joblib

class FaceRecognitionSystem:
    def __init__(self):
        self.detector = MTCNN()
        self.face_encoder = None
        self.classifier = None
        self.label_encoder = None
        self.load_models()
        
    def load_models(self):
        """Load pre-trained models"""
        try:
            # Load FaceNet model (simplified version)
            # In a real implementation, you would load the actual FaceNet model
            self.face_encoder = self.create_simple_encoder()
            
            # Load classifier if exists
            if os.path.exists('models/face_classifier.pkl'):
                self.classifier = joblib.load('models/face_classifier.pkl')
                self.label_encoder = joblib.load('models/label_encoder.pkl')
        except Exception as e:
            print(f"Error loading models: {e}")
    
    def create_simple_encoder(self):
        """Create a simple face encoder (placeholder for FaceNet)"""
        # This is a simplified version - in reality, you'd use pre-trained FaceNet
        model = tf.keras.Sequential([
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(160, 160, 3)),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2, 2),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(512, activation='relu'),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dense(128)  # Embedding layer
        ])
        return model
    
    def detect_faces(self, image):
        """Detect faces in an image using MTCNN"""
        try:
            # Convert BGR to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                rgb_image = image
            
            # Detect faces
            results = self.detector.detect_faces(rgb_image)
            
            faces = []
            for result in results:
                if result['confidence'] > 0.9:  # High confidence threshold
                    x, y, w, h = result['box']
                    # Ensure coordinates are within image bounds
                    x = max(0, x)
                    y = max(0, y)
                    w = min(w, rgb_image.shape[1] - x)
                    h = min(h, rgb_image.shape[0] - y)
                    
                    face = rgb_image[y:y+h, x:x+w]
                    faces.append({
                        'face': face,
                        'box': (x, y, w, h),
                        'confidence': result['confidence']
                    })
            
            return faces
        except Exception as e:
            print(f"Error detecting faces: {e}")
            return []
    
    def preprocess_face(self, face):
        """Preprocess face for recognition"""
        try:
            # Resize to standard size
            face_resized = cv2.resize(face, (160, 160))
            # Normalize pixel values
            face_normalized = face_resized.astype('float32') / 255.0
            return face_normalized
        except Exception as e:
            print(f"Error preprocessing face: {e}")
            return None
    
    def extract_face_encoding(self, face):
        """Extract face encoding using the encoder model"""
        try:
            preprocessed_face = self.preprocess_face(face)
            if preprocessed_face is None:
                return None
            
            # Add batch dimension
            face_batch = np.expand_dims(preprocessed_face, axis=0)
            
            # Get encoding
            if self.face_encoder:
                encoding = self.face_encoder.predict(face_batch, verbose=0)
                return encoding[0]
            else:
                # Fallback: use simple feature extraction
                return self.simple_feature_extraction(preprocessed_face)
        except Exception as e:
            print(f"Error extracting face encoding: {e}")
            return None
    
    def simple_feature_extraction(self, face):
        """Simple feature extraction as fallback"""
        # Convert to grayscale and extract basic features
        gray = cv2.cvtColor((face * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
        
        # Calculate histogram features
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist.flatten()
        
        # Calculate LBP-like features (simplified)
        features = []
        for i in range(0, gray.shape[0], 20):
            for j in range(0, gray.shape[1], 20):
                patch = gray[i:i+20, j:j+20]
                if patch.size > 0:
                    features.extend([patch.mean(), patch.std()])
        
        # Combine features
        combined_features = np.concatenate([hist[:50], features[:78]])  # 128 features total
        return combined_features
    
    def train_classifier(self, encodings, labels):
        """Train the face classifier"""
        try:
            os.makedirs('models', exist_ok=True)
            
            # Encode labels
            self.label_encoder = LabelEncoder()
            encoded_labels = self.label_encoder.fit_transform(labels)
            
            # Train SVM classifier
            self.classifier = SVC(kernel='linear', probability=True)
            self.classifier.fit(encodings, encoded_labels)
            
            # Save models
            joblib.dump(self.classifier, 'models/face_classifier.pkl')
            joblib.dump(self.label_encoder, 'models/label_encoder.pkl')
            
            return True
        except Exception as e:
            print(f"Error training classifier: {e}")
            return False
    
    def recognize_face(self, face_encoding):
        """Recognize a face using the trained classifier"""
        try:
            if self.classifier is None or self.label_encoder is None:
                return None, 0.0
            
            # Reshape encoding for prediction
            encoding_reshaped = face_encoding.reshape(1, -1)
            
            # Get prediction and probability
            prediction = self.classifier.predict(encoding_reshaped)
            probabilities = self.classifier.predict_proba(encoding_reshaped)
            
            # Get the predicted label and confidence
            predicted_label = self.label_encoder.inverse_transform(prediction)[0]
            confidence = np.max(probabilities)
            
            return predicted_label, confidence
        except Exception as e:
            print(f"Error recognizing face: {e}")
            return None, 0.0
    
    def process_image_for_attendance(self, image_path):
        """Process an image and return recognized faces"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return []
            
            # Detect faces
            faces = self.detect_faces(image)
            
            recognized_faces = []
            for face_data in faces:
                face = face_data['face']
                
                # Extract encoding
                encoding = self.extract_face_encoding(face)
                if encoding is not None:
                    # Recognize face
                    student_id, confidence = self.recognize_face(encoding)
                    
                    if student_id and confidence > 0.7:  # Confidence threshold
                        recognized_faces.append({
                            'student_id': student_id,
                            'confidence': confidence,
                            'box': face_data['box']
                        })
            
            return recognized_faces
        except Exception as e:
            print(f"Error processing image: {e}")
            return []