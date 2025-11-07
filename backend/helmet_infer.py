"""
Helmet Detection Module using Intel OpenVINO's pre-trained hardhat-detection-0001 model.
Detects heads and helmets in construction site images.
"""

import cv2
import numpy as np
import openvino as ov
from typing import List, Dict, Tuple


# Class labels from the hardhat-detection-0001 model
HEAD = 0
HELMET = 1


class HelmetDetector:
    """OpenVINO-based helmet detection using pre-trained model."""
    
    def __init__(self, model_xml: str, confidence_threshold: float = 0.5):
        """
        Initialize the helmet detector.
        
        Args:
            model_xml: Path to the .xml model file
            confidence_threshold: Minimum confidence for detections (0.0-1.0)
        """
        self.conf_threshold = confidence_threshold
        
        # Initialize OpenVINO
        print("[INFO] Initializing OpenVINO for helmet detection...")
        self.ie = ov.Core()
        
        # Load the model
        print(f"[INFO] Loading model from: {model_xml}")
        model = self.ie.read_model(model_xml)
        
        # Compile for CPU
        self.compiled_model = self.ie.compile_model(model, "CPU")
        
        # Get input and output layers
        self.input_layer = self.compiled_model.inputs[0]
        self.output_layer = self.compiled_model.outputs[0]
        
        # Get input shape (N, C, H, W)
        self.input_shape = self.input_layer.shape
        self.input_height = self.input_shape[2]
        self.input_width = self.input_shape[3]
        
        print(f"[INFO] Model loaded successfully. Input shape: {self.input_shape}")
        print(f"[INFO] Confidence threshold: {self.conf_threshold}")
    
    def detect_hardhat_bboxes(self, frame: np.ndarray) -> List[Dict]:
        """
        Detect heads and helmets in a frame.
        
        Args:
            frame: Input BGR image (OpenCV format)
            
        Returns:
            List of detections, each dict containing:
                - x1, y1, x2, y2: Bounding box coordinates
                - label: 0 for head, 1 for helmet
                - conf: Confidence score (0.0-1.0)
        """
        H, W = frame.shape[:2]
        
        # Resize frame to model input size
        resized = cv2.resize(frame, (self.input_width, self.input_height))
        
        # Convert to NCHW format and normalize
        blob = resized.transpose(2, 0, 1)[np.newaxis, :].astype(np.float32)
        
        # Run inference
        result = self.compiled_model([blob])[self.output_layer]
        
        # Parse detections
        # Output format: [1, 1, N, 7] where each detection is:
        # [image_id, label, conf, x_min, y_min, x_max, y_max]
        detections = []
        
        for det in result[0, 0]:
            _, label, conf, x_min, y_min, x_max, y_max = det
            
            if conf < self.conf_threshold:
                continue
            
            # Convert normalized coordinates to pixel coordinates
            x1 = int(x_min * W)
            y1 = int(y_min * H)
            x2 = int(x_max * W)
            y2 = int(y_max * H)
            
            # Ensure coordinates are within frame bounds
            x1 = max(0, min(x1, W - 1))
            y1 = max(0, min(y1, H - 1))
            x2 = max(0, min(x2, W - 1))
            y2 = max(0, min(y2, H - 1))
            
            detections.append({
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "label": int(label),
                "conf": float(conf)
            })
        
        return detections
    
    def infer_helmet_violations(
        self, 
        frame: np.ndarray, 
        iou_threshold: float = 0.3
    ) -> Tuple[bool, List[Dict], List[Dict]]:
        """
        Detect helmet safety violations.
        
        A violation occurs when a HEAD is detected without an overlapping HELMET.
        
        Args:
            frame: Input BGR image
            iou_threshold: Minimum IoU for head-helmet matching
            
        Returns:
            Tuple of:
                - has_violation: True if any violations detected
                - violations: List of head boxes without helmets
                - helmets: List of detected helmet boxes
        """
        # Get all detections
        detections = self.detect_hardhat_bboxes(frame)
        
        # Separate heads and helmets
        heads = [d for d in detections if d["label"] == HEAD]
        helmets = [d for d in detections if d["label"] == HELMET]
        
        # Find heads without helmets
        violations = []
        
        for head in heads:
            # Check if this head overlaps with any helmet
            has_helmet = False
            
            for helmet in helmets:
                if self._calculate_iou(head, helmet) > iou_threshold:
                    has_helmet = True
                    break
            
            if not has_helmet:
                violations.append(head)
        
        has_violation = len(violations) > 0
        
        return has_violation, violations, helmets
    
    @staticmethod
    def _calculate_iou(box_a: Dict, box_b: Dict) -> float:
        """
        Calculate Intersection over Union (IoU) between two boxes.
        
        Args:
            box_a, box_b: Boxes with keys x1, y1, x2, y2
            
        Returns:
            IoU value (0.0-1.0)
        """
        # Get coordinates
        xa1, ya1, xa2, ya2 = box_a["x1"], box_a["y1"], box_a["x2"], box_a["y2"]
        xb1, yb1, xb2, yb2 = box_b["x1"], box_b["y1"], box_b["x2"], box_b["y2"]
        
        # Calculate intersection
        xi1 = max(xa1, xb1)
        yi1 = max(ya1, yb1)
        xi2 = min(xa2, xb2)
        yi2 = min(ya2, yb2)
        
        inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
        
        # Calculate union
        area_a = (xa2 - xa1) * (ya2 - ya1)
        area_b = (xb2 - xb1) * (yb2 - yb1)
        union_area = area_a + area_b - inter_area
        
        # Avoid division by zero
        if union_area == 0:
            return 0.0
        
        return inter_area / union_area


# Simple functional interface for backwards compatibility
_detector = None


def init_detector(model_xml: str, conf_threshold: float = 0.5):
    """Initialize the global detector instance."""
    global _detector
    _detector = HelmetDetector(model_xml, conf_threshold)


def detect_hardhat_bboxes(frame: np.ndarray, conf_thr: float = 0.5) -> List[Dict]:
    """Detect heads and helmets in frame (functional interface)."""
    global _detector
    if _detector is None:
        raise RuntimeError("Detector not initialized. Call init_detector() first.")
    return _detector.detect_hardhat_bboxes(frame)


def infer_helmet_violations(
    frame: np.ndarray, 
    iou_thr: float = 0.3, 
    conf_thr: float = 0.5
) -> Tuple[bool, List[Dict], List[Dict]]:
    """Detect helmet violations (functional interface)."""
    global _detector
    if _detector is None:
        raise RuntimeError("Detector not initialized. Call init_detector() first.")
    return _detector.infer_helmet_violations(frame, iou_thr)


if __name__ == "__main__":
    # Test the detector
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python helmet_infer.py <model_xml_path> [image_path]")
        sys.exit(1)
    
    model_path = sys.argv[1]
    detector = HelmetDetector(model_path)
    
    if len(sys.argv) > 2:
        # Test on image
        image_path = sys.argv[2]
        frame = cv2.imread(image_path)
        
        if frame is None:
            print(f"Error: Could not load image from {image_path}")
            sys.exit(1)
        
        has_violation, violations, helmets = detector.infer_helmet_violations(frame)
        
        print(f"\n[RESULTS]")
        print(f"Violations detected: {has_violation}")
        print(f"Number of heads without helmets: {len(violations)}")
        print(f"Number of helmets detected: {len(helmets)}")
        
        # Draw results
        for v in violations:
            cv2.rectangle(frame, (v["x1"], v["y1"]), (v["x2"], v["y2"]), (0, 0, 255), 2)
            cv2.putText(frame, "NO HELMET", (v["x1"], v["y1"] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        for h in helmets:
            cv2.rectangle(frame, (h["x1"], h["y1"]), (h["x2"], h["y2"]), (0, 255, 0), 2)
            cv2.putText(frame, "HELMET", (h["x1"], h["y1"] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        cv2.imshow("Helmet Detection", frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        print("[INFO] Detector initialized successfully!")
        print("[INFO] Run with an image path to test: python helmet_infer.py <model> <image>")
