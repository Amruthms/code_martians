"""
Test All Emergency Contact Numbers
"""
import requests
import time

contacts = {
    'fire': '+916361986326',
    'ambulance': '+917204200386',
    'police': '+918618464709',
    'manager': '+91934273999'
}

print("=" * 60)
print("🚨 TESTING ALL EMERGENCY CONTACTS")
print("=" * 60)

for contact_type, phone_number in contacts.items():
    print(f"\n📞 Testing {contact_type.upper()}: {phone_number}")
    print(f"   Calling endpoint: /voice/call/{contact_type}")
    
    try:
        response = requests.post(
            f"http://localhost:8000/voice/call/{contact_type}",
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ SUCCESS - Call SID: {data.get('sid', 'N/A')}")
            print(f"   📱 Calling: {data.get('to', 'N/A')}")
        elif response.status_code == 429:
            print(f"   ⏳ Rate limited - wait 20 seconds between calls")
        else:
            print(f"   ❌ FAILED - Status: {response.status_code}")
            print(f"   Error: {response.json()}")
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Cannot connect to backend on http://localhost:8000")
        break
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Wait between calls to avoid rate limiting
    if contact_type != 'manager':
        print(f"   Waiting 3 seconds before next call...")
        time.sleep(3)

print("\n" + "=" * 60)
print("✅ ALL TESTS COMPLETE")
print("=" * 60)
print("\n⚠️  IMPORTANT:")
print("For Twilio trial accounts, verify these numbers at:")
print("https://console.twilio.com/us1/develop/phone-numbers/manage/verified")
print("\nNumbers to verify:")
for contact_type, phone_number in contacts.items():
    print(f"  - {phone_number} ({contact_type})")
print("=" * 60)
