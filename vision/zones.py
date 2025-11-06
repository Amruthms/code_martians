import cv2
import numpy as np

def centroid(x, y, w, h):
    """
    Calculate the centroid of a bounding box
    Returns (cx, cy)
    """
    cx = x + w // 2
    cy = y + h // 2
    return (cx, cy)

def in_polygon(point, polygon):
    """
    Check if a point is inside a polygon using ray casting algorithm
    point: (x, y)
    polygon: list of [x, y] coordinates
    """
    if not polygon or len(polygon) < 3:
        return False
    
    x, y = point
    n = len(polygon)
    inside = False
    
    p1x, p1y = polygon[0]
    for i in range(1, n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    
    return inside

def draw_polygon(frame, polygon, color):
    """
    Draw a polygon on the frame
    polygon: list of [x, y] coordinates
    color: (B, G, R) tuple
    """
    if not polygon or len(polygon) < 3:
        return
    
    try:
        # Convert polygon to numpy array
        pts = np.array(polygon, np.int32)
        pts = pts.reshape((-1, 1, 2))
        
        # Draw polygon
        cv2.polylines(frame, [pts], True, color, 2)
        
        # Optionally fill with semi-transparent color
        overlay = frame.copy()
        cv2.fillPoly(overlay, [pts], color)
        cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)
    
    except Exception as e:
        pass

def distance(point1, point2):
    """
    Calculate Euclidean distance between two points
    """
    x1, y1 = point1
    x2, y2 = point2
    return np.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def check_proximity(centroids, threshold):
    """
    Check if any two persons are too close
    Returns list of (person1_idx, person2_idx, distance)
    """
    violations = []
    
    for i, c1 in enumerate(centroids):
        for j, c2 in enumerate(centroids[i+1:], start=i+1):
            dist = distance(c1, c2)
            if dist < threshold:
                violations.append((i, j, dist))
    
    return violations
