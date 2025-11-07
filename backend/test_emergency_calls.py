"""
Quick test script for Twilio Emergency Calling System
Run this after setting up .env to verify everything works
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_voice_status():
    """Test if Twilio is configured"""
    print("\n🔍 Testing Twilio Configuration...")
    try:
        response = requests.get(f"{BASE_URL}/voice/status")
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"📋 Configured: {data.get('configured')}")
        if data.get('configured'):
            print(f"📞 Caller Number: {data.get('caller_number')}")
            print(f"🌐 Base URL: {data.get('base_url')}")
            print(f"🚨 Emergency Contacts:")
            for name, info in data.get('emergency_contacts', {}).items():
                print(f"   - {name.capitalize()}: {info['number']}")
        else:
            print("❌ Twilio not configured. Check .env file.")
        return data.get('configured', False)
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_twiml_endpoint():
    """Test TwiML generation"""
    print("\n🔍 Testing TwiML Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/voice/twiml", params={"msg": "Test emergency message"})
        print(f"✅ Status: {response.status_code}")
        print(f"📄 TwiML Response:")
        print(response.text[:200] + "...")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_emergency_call(contact: str):
    """Test calling a preset emergency contact"""
    print(f"\n📞 Testing Emergency Call to: {contact.upper()}")
    print("⚠️  WARNING: This will make a REAL call if Twilio is configured!")
    confirm = input(f"   Type 'yes' to proceed with calling {contact}: ")
    
    if confirm.lower() != 'yes':
        print("   ⏭️  Skipped")
        return False
    
    try:
        response = requests.post(f"{BASE_URL}/voice/call/{contact}")
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Call initiated successfully!")
            print(f"   SID: {data.get('sid')}")
            print(f"   To: {data.get('to')}")
            print(f"   Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Error: {data.get('detail')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_custom_call():
    """Test calling a custom number"""
    print("\n📞 Testing Custom Emergency Call")
    print("⚠️  WARNING: This will make a REAL call if Twilio is configured!")
    
    phone = input("   Enter phone number (+countrycode + number, e.g., +919876543210): ")
    if not phone:
        print("   ⏭️  Skipped")
        return False
    
    message = input("   Enter message (or press Enter for default): ")
    if not message:
        message = "This is a test emergency call from the AI safety system."
    
    confirm = input(f"   Type 'yes' to call {phone}: ")
    if confirm.lower() != 'yes':
        print("   ⏭️  Skipped")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/voice/call",
            json={"to": phone, "message": message}
        )
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ Call initiated successfully!")
            print(f"   SID: {data.get('sid')}")
            print(f"   To: {data.get('to')}")
            return True
        else:
            print(f"❌ Error: {data.get('detail')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🚨 Twilio Emergency Calling System - Test Suite")
    print("=" * 60)
    print("\n⚠️  Make sure backend is running: python backend/app.py")
    print("⚠️  For local testing, start ngrok: ngrok http 8000")
    print("⚠️  Update BASE_URL in backend/.env with ngrok HTTPS URL\n")
    
    input("Press Enter to start tests...")
    
    # Test 1: Check configuration
    configured = test_voice_status()
    
    if not configured:
        print("\n❌ Twilio not configured. Please set up .env file first.")
        print("   See EMERGENCY_CALLING_SETUP.md for instructions.")
        return
    
    # Test 2: TwiML endpoint
    test_twiml_endpoint()
    
    # Test 3: Emergency call options
    print("\n" + "=" * 60)
    print("🚨 Emergency Call Tests")
    print("=" * 60)
    print("\nOptions:")
    print("1. Test Fire Emergency")
    print("2. Test Ambulance")
    print("3. Test Police")
    print("4. Test Manager")
    print("5. Test Custom Number")
    print("6. Skip all call tests")
    
    choice = input("\nEnter choice (1-6): ")
    
    if choice == "1":
        test_emergency_call("fire")
    elif choice == "2":
        test_emergency_call("ambulance")
    elif choice == "3":
        test_emergency_call("police")
    elif choice == "4":
        test_emergency_call("manager")
    elif choice == "5":
        test_custom_call()
    else:
        print("\n⏭️  Skipped call tests")
    
    print("\n" + "=" * 60)
    print("✅ Tests Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Check Twilio Console for call logs")
    print("2. Integrate emergency buttons in frontend")
    print("3. Set up auto-calling on critical violations")
    print("\n🚀 Happy Building!")

if __name__ == "__main__":
    main()
