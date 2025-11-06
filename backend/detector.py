import cv2
import numpy as np

def detect_persons(frame):
    """
    Detect persons in the frame using Haar Cascade or HOG
    Returns list of bounding boxes (x, y, w, h)
    """
    try:
        # Try to use HOG person detector (more accurate but slower)
        hog = cv2.HOGDescriptor()
        hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        
        # Detect people
        boxes, weights = hog.detectMultiScale(frame, winStride=(8, 8), padding=(4, 4), scale=1.05)
        
        # Convert to (x, y, w, h) format
        persons = []
        for (x, y, w, h) in boxes:
            persons.append((int(x), int(y), int(w), int(h)))
        
        return persons
    
    except Exception as e:
        # Fallback: return empty list if detection fails
        return []

def detect_persons_haar(frame):
    """
    Fallback: Detect persons using Haar Cascade (faster but less accurate)
    """
    try:
        # Load Haar Cascade classifier
        cascade_path = cv2.data.haarcascades + 'haarcascade_fullbody.xml'
        cascade = cv2.CascadeClassifier(cascade_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect
        persons = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        return list(persons)
    
    except Exception as e:
        return []
