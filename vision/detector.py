import cv2

# Simple, robust baseline: HOG+SVM (no extra weights needed)
_hog = cv2.HOGDescriptor()
_hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

def detect_persons(frame):
    # returns list of (x,y,w,h)
    rects, _ = _hog.detectMultiScale(frame, winStride=(8,8), padding=(8,8), scale=1.05)
    return rects