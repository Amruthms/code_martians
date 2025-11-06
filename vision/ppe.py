import cv2
import numpy as np

def roi_slices(x, y, w, h):
    """
    Get ROI slices for head and torso regions
    Returns (head_roi, torso_roi) as numpy slices
    """
    # Head region: top 40% of bounding box
    head_roi = (slice(y, y + int(h * 0.4)), slice(x, x + w))
    
    # Torso region: middle 40-80% of bounding box
    torso_roi = (slice(y + int(h * 0.4), y + int(h * 0.8)), slice(x, x + w))
    
    return head_roi, torso_roi

def crop(frame, roi):
    """
    Crop frame using ROI slice
    """
    try:
        return frame[roi]
    except:
        return frame

def mask_ratio_hsv(img, h1, h2, s1, s2, v1, v2):
    """
    Calculate the ratio of pixels matching the HSV color range
    Returns ratio between 0.0 and 1.0
    """
    if img is None or img.size == 0:
        return 0.0
    
    try:
        # Convert to HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Create mask for the color range
        lower = np.array([h1, s1, v1])
        upper = np.array([h2, s2, v2])
        mask = cv2.inRange(hsv, lower, upper)
        
        # Calculate ratio of matching pixels
        total_pixels = img.shape[0] * img.shape[1]
        matching_pixels = cv2.countNonZero(mask)
        
        ratio = matching_pixels / total_pixels if total_pixels > 0 else 0.0
        
        return ratio
    
    except Exception as e:
        return 0.0

def detect_ppe(frame, bbox, helmet_hsv, vest_hsv, helmet_thresh, vest_thresh):
    """
    Complete PPE detection for a person bounding box
    Returns (helmet_detected, vest_detected, confidence)
    """
    x, y, w, h = bbox
    
    # Get ROIs
    head_roi, torso_roi = roi_slices(x, y, w, h)
    head_img = crop(frame, head_roi)
    torso_img = crop(frame, torso_roi)
    
    # Detect helmet
    helmet_ratio = mask_ratio_hsv(head_img, **helmet_hsv)
    helmet_ok = helmet_ratio > helmet_thresh
    
    # Detect vest
    vest_ratio = mask_ratio_hsv(torso_img, **vest_hsv)
    vest_ok = vest_ratio > vest_thresh
    
    # Calculate confidence
    confidence = (helmet_ratio + vest_ratio) / 2.0
    
    return helmet_ok, vest_ok, confidence
