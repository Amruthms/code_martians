"""
Hi-Vis Safety Vest Detection Module using HSV color filtering.
Detects high-visibility yellow/orange safety vests based on color.
"""

import cv2
import numpy as np
from typing import Dict


class VestDetector:
    """HSV-based hi-vis vest detector."""
    
    def __init__(
        self,
        h1: int = 15,
        h2: int = 45,
        s1: int = 120,
        s2: int = 255,
        v1: int = 120,
        v2: int = 255
    ):
        """
        Initialize vest detector with HSV color ranges.
        
        Default values detect yellow/orange hi-vis colors:
        - Hue: 15-45 (yellow to orange range)
        - Saturation: 120-255 (highly saturated colors)
        - Value: 120-255 (bright colors)
        
        Args:
            h1, h2: Hue range (0-179 in OpenCV)
            s1, s2: Saturation range (0-255)
            v1, v2: Value/brightness range (0-255)
        """
        self.hsv_lower = np.array([h1, s1, v1])
        self.hsv_upper = np.array([h2, s2, v2])
        
        print(f"[INFO] Vest detector initialized with HSV range:")
        print(f"       H: {h1}-{h2}, S: {s1}-{s2}, V: {v1}-{v2}")
    
    def vest_ratio(self, bgr_roi: np.ndarray) -> float:
        """
        Calculate the ratio of hi-vis pixels in an image region.
        
        Args:
            bgr_roi: BGR image region (e.g., torso area)
            
        Returns:
            Ratio of hi-vis pixels (0.0-1.0)
        """
        if bgr_roi.size == 0 or bgr_roi.shape[0] == 0 or bgr_roi.shape[1] == 0:
            return 0.0
        
        # Convert to HSV
        hsv_img = cv2.cvtColor(bgr_roi, cv2.COLOR_BGR2HSV)
        
        # Create mask for hi-vis colors
        mask = cv2.inRange(hsv_img, self.hsv_lower, self.hsv_upper)
        
        # Calculate ratio of hi-vis pixels
        total_pixels = mask.size
        hivis_pixels = np.count_nonzero(mask)
        ratio = hivis_pixels / total_pixels if total_pixels > 0 else 0.0
        
        return ratio
    
    def has_vest(self, bgr_roi: np.ndarray, threshold: float = 0.15) -> bool:
        """
        Check if a region contains a hi-vis vest.
        
        Args:
            bgr_roi: BGR image region (e.g., torso area)
            threshold: Minimum ratio of hi-vis pixels to consider vest present
            
        Returns:
            True if vest detected, False otherwise
        """
        ratio = self.vest_ratio(bgr_roi)
        return ratio >= threshold
    
    def visualize_mask(self, bgr_roi: np.ndarray) -> np.ndarray:
        """
        Create a visualization of the hi-vis detection mask.
        
        Args:
            bgr_roi: BGR image region
            
        Returns:
            Color-coded visualization (green = hi-vis detected)
        """
        if bgr_roi.size == 0:
            return bgr_roi
        
        hsv_img = cv2.cvtColor(bgr_roi, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv_img, self.hsv_lower, self.hsv_upper)
        
        # Create green overlay for hi-vis regions
        overlay = bgr_roi.copy()
        overlay[mask > 0] = [0, 255, 0]  # Green
        
        # Blend with original
        result = cv2.addWeighted(bgr_roi, 0.7, overlay, 0.3, 0)
        
        return result


# Global detector instance for functional interface
_vest_detector = None


def init_vest_detector(h1=15, h2=45, s1=120, s2=255, v1=120, v2=255):
    """Initialize the global vest detector instance."""
    global _vest_detector
    _vest_detector = VestDetector(h1, h2, s1, s2, v1, v2)


def vest_ratio(bgr_roi: np.ndarray, hsv: Dict = None) -> float:
    """
    Calculate vest ratio (functional interface).
    
    Args:
        bgr_roi: BGR image region
        hsv: Optional dict with keys h1, h2, s1, s2, v1, v2
        
    Returns:
        Ratio of hi-vis pixels (0.0-1.0)
    """
    global _vest_detector
    
    # Use provided HSV values or initialize default detector
    if hsv is not None:
        detector = VestDetector(
            hsv.get("h1", 15),
            hsv.get("h2", 45),
            hsv.get("s1", 120),
            hsv.get("s2", 255),
            hsv.get("v1", 120),
            hsv.get("v2", 255)
        )
        return detector.vest_ratio(bgr_roi)
    
    if _vest_detector is None:
        init_vest_detector()
    
    return _vest_detector.vest_ratio(bgr_roi)


if __name__ == "__main__":
    # Test the vest detector
    import sys
    
    print("=== Hi-Vis Vest Detector Test ===\n")
    
    if len(sys.argv) < 2:
        print("Usage: python vest_hsv.py <image_path>")
        print("\nThis will analyze the image and show hi-vis detection.")
        sys.exit(1)
    
    image_path = sys.argv[1]
    frame = cv2.imread(image_path)
    
    if frame is None:
        print(f"Error: Could not load image from {image_path}")
        sys.exit(1)
    
    # Create detector
    detector = VestDetector()
    
    # Analyze full image
    ratio = detector.vest_ratio(frame)
    has_vest = detector.has_vest(frame, threshold=0.15)
    
    print(f"Image: {image_path}")
    print(f"Hi-vis pixel ratio: {ratio:.4f} ({ratio*100:.2f}%)")
    print(f"Vest detected (threshold=0.15): {has_vest}")
    
    # Create visualization
    visualization = detector.visualize_mask(frame)
    
    # Add text overlay
    text = f"Hi-Vis Ratio: {ratio*100:.2f}%"
    status = "VEST DETECTED" if has_vest else "NO VEST"
    color = (0, 255, 0) if has_vest else (0, 0, 255)
    
    cv2.putText(visualization, text, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(visualization, status, (10, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
    
    # Show results
    cv2.imshow("Original", frame)
    cv2.imshow("Hi-Vis Detection", visualization)
    
    print("\nPress any key to close windows...")
    cv2.waitKey(0)
    cv2.destroyAllWindows()
