import cv2, numpy as np

def roi_slices(x,y,w,h):
    head_y2  = y + int(h*0.35)
    torso_y1 = y + int(h*0.35)
    torso_y2 = y + int(h*0.70)
    head  = (x, y, w, head_y2 - y)
    torso = (x, torso_y1, w, torso_y2 - torso_y1)
    return head, torso

def crop(frame, roi):
    x,y,w,h = roi
    return frame[max(0,y):y+h, max(0,x):x+w]

def mask_ratio_hsv(bgr_roi, h1,h2,s1,s2,v1,v2):
    if bgr_roi.size == 0: return 0.0
    hsv = cv2.cvtColor(bgr_roi, cv2.COLOR_BGR2HSV)
    lower = (h1, s1, v1); upper = (h2, s2, v2)
    mask = cv2.inRange(hsv, lower, upper)
    return float((mask > 0).mean())