import requests
import time

print("Testing video feed endpoint...")
print("=" * 50)

url = "http://localhost:8000/video_feed"

try:
    print(f"Connecting to: {url}")
    response = requests.get(url, stream=True, timeout=10)
    
    print(f"Status code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    
    if response.status_code == 200:
        print("\n✅ Connection successful!")
        print("Waiting for first frame...")
        
        # Read first few bytes to see if we're getting data
        chunk_count = 0
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                chunk_count += 1
                print(f"Received chunk {chunk_count}: {len(chunk)} bytes")
                
                if chunk_count >= 5:
                    print("\n✅ Video stream is working!")
                    break
        
        if chunk_count == 0:
            print("❌ No data received from stream")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.Timeout:
    print("❌ Timeout - server not responding")
except requests.exceptions.ConnectionError:
    print("❌ Connection error - is the server running?")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("=" * 50)
