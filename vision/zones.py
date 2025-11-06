import cv2, numpy as np

def centroid(x,y,w,h):
    return (int(x + w/2), int(y + h/2))

def in_polygon(pt, polygon):
    poly = np.array(polygon, dtype=np.int32)
    return cv2.pointPolygonTest(poly, pt, False) >= 0

def draw_polygon(frame, polygon, color=(0,0,255)):
    poly = np.array(polygon, dtype=np.int32)
    cv2.polylines(frame, [poly], isClosed=True, color=color, thickness=2)