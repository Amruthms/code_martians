import cv2
import sys

print("Testing camera access...")
print("=" * 50)

# Try to open camera 0
camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("❌ ERROR: Could not open camera 0")
    print("\nPossible reasons:")
    print("1. No webcam is connected to your computer")
    print("2. Another application is using the camera")
    print("3. Camera permissions are denied")
    print("4. Camera driver issues")
    sys.exit(1)

print("✅ Camera opened successfully!")

# Try to read a frame
success, frame = camera.read()

if not success or frame is None:
    print("❌ ERROR: Could not read frame from camera")
    camera.release()
    sys.exit(1)

print(f"✅ Successfully read frame!")
print(f"   Frame shape: {frame.shape}")
print(f"   Resolution: {frame.shape[1]}x{frame.shape[0]}")

# Try to read a few more frames
for i in range(5):
    success, frame = camera.read()
    if success:
        print(f"✅ Frame {i+1} read successfully")
    else:
        print(f"❌ Failed to read frame {i+1}")

camera.release()
print("\n" + "=" * 50)
print("Camera test completed!")
