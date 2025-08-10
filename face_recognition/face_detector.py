import cv2  # type: ignore
import numpy as np
import os
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
import joblib


class FaceRecognitionSystem:
    def __init__(self):
        # Use OpenCV Haar cascade for face detection
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.classifier = None
        self.label_encoder = None
        self.load_models()

    def load_models(self):
        """Load trained classifier and label encoder if they exist."""
        try:
            if os.path.exists('models/face_classifier.pkl'):
                self.classifier = joblib.load('models/face_classifier.pkl')
            if os.path.exists('models/label_encoder.pkl'):
                self.label_encoder = joblib.load('models/label_encoder.pkl')
        except Exception as e:
            print(f"Error loading models: {e}")

    def detect_faces(self, image):
        """Detect faces in an image using OpenCV Haar cascade (returns RGB faces)."""
        try:
            if image is None:
                return []
            # Ensure BGR input, convert to gray for detection
            if len(image.shape) == 3 and image.shape[2] == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                gray = image
                rgb_image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

            faces_rects = self.face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

            faces = []
            for (x, y, w, h) in faces_rects:
                x = max(0, x)
                y = max(0, y)
                w = max(1, min(w, rgb_image.shape[1] - x))
                h = max(1, min(h, rgb_image.shape[0] - y))
                face = rgb_image[y:y+h, x:x+w]
                faces.append({
                    'face': face,
                    'box': (int(x), int(y), int(w), int(h)),
                    'confidence': 1.0  # Haar does not provide confidence; treat as detected
                })
            return faces
        except Exception as e:
            print(f"Error detecting faces: {e}")
            return []

    def preprocess_face(self, face):
        """Preprocess face for recognition: resize to 160x160 and normalize to 0..1."""
        try:
            face_resized = cv2.resize(face, (160, 160))
            face_normalized = face_resized.astype('float32') / 255.0
            return face_normalized
        except Exception as e:
            print(f"Error preprocessing face: {e}")
            return None

    def extract_face_encoding(self, face):
        """Extract a 128-D encoding using handcrafted features (hist + patch stats)."""
        try:
            preprocessed_face = self.preprocess_face(face)
            if preprocessed_face is None:
                return None
            return self.simple_feature_extraction(preprocessed_face)
        except Exception as e:
            print(f"Error extracting face encoding: {e}")
            return None

    def simple_feature_extraction(self, face):
        """Simple handcrafted features: grayscale histogram and patch statistics."""
        gray = cv2.cvtColor((face * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
        # Histogram features
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
        # Patch mean/std features
        features = []
        for i in range(0, gray.shape[0], 20):
            for j in range(0, gray.shape[1], 20):
                patch = gray[i:i+20, j:j+20]
                if patch.size > 0:
                    features.extend([float(patch.mean()), float(patch.std())])
        # Combine to 128-D vector
        combined = np.concatenate([hist[:50], features[:78]])  # 128 features total
        return combined

    def train_classifier(self, encodings, labels):
        """Train SVM classifier and persist models."""
        try:
            os.makedirs('models', exist_ok=True)
            self.label_encoder = LabelEncoder()
            encoded_labels = self.label_encoder.fit_transform(labels)
            self.classifier = SVC(kernel='linear', probability=True)
            self.classifier.fit(encodings, encoded_labels)
            joblib.dump(self.classifier, 'models/face_classifier.pkl')
            joblib.dump(self.label_encoder, 'models/label_encoder.pkl')
            return True
        except Exception as e:
            print(f"Error training classifier: {e}")
            return False

    def recognize_face(self, face_encoding):
        """Recognize a face using trained classifier, returns (label, confidence)."""
        try:
            if self.classifier is None or self.label_encoder is None:
                return None, 0.0
            encoding_reshaped = np.asarray(face_encoding).reshape(1, -1)
            prediction = self.classifier.predict(encoding_reshaped)
            probabilities = self.classifier.predict_proba(encoding_reshaped)
            predicted_label = self.label_encoder.inverse_transform(prediction)[0]
            confidence = float(np.max(probabilities))
            return predicted_label, confidence
        except Exception as e:
            print(f"Error recognizing face: {e}")
            return None, 0.0

    def process_image_for_attendance(self, image_path):
        """Process an image and return recognized faces with boxes and confidences."""
        try:
            image = cv2.imread(image_path)
            if image is None:
                return []
            faces = self.detect_faces(image)
            recognized_faces = []
            for face_data in faces:
                face = face_data['face']
                encoding = self.extract_face_encoding(face)
                if encoding is None:
                    continue
                student_id, confidence = self.recognize_face(encoding)
                if student_id and confidence > 0.7:
                    recognized_faces.append({
                        'student_id': student_id,
                        'confidence': confidence,
                        'box': face_data['box']
                    })
            return recognized_faces
        except Exception as e:
            print(f"Error processing image: {e}")
            return []