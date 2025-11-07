"""
Quick Fire Emergency Call Test
"""
import requests
import time

print("=" * 60)
print("🔥 TESTING FIRE EMERGENCY CALL")
print("=" * 60)
print("Calling: +916361986326")
print("Waiting for backend to be ready...")
time.sleep(2)

try:
    response = requests.post(
        "http://localhost:8000/voice/call/fire",
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("\n✅ CALL INITIATED SUCCESSFULLY!")
        print("📞 Check your phone: +916361986326")
        print("You should receive a call from: +12174396550")
    else:
        print("\n❌ CALL FAILED")
        print(f"Error: {response.json()}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ Cannot connect to backend")
    print("Make sure backend is running on http://localhost:8000")
except Exception as e:
    print(f"\n❌ Error: {e}")

print("=" * 60)
