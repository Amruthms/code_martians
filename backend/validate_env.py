"""
Validate Twilio Environment Configuration
"""
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

print("=" * 60)
print("🔍 TWILIO CONFIGURATION VALIDATION")
print("=" * 60)

# Check Twilio credentials
twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_CALLER_NUMBER')
base_url = os.getenv('BASE_URL')

# Validation results
all_good = True

if twilio_sid and twilio_sid.startswith('AC'):
    print(f"✅ TWILIO_ACCOUNT_SID: {twilio_sid[:10]}... (Valid format)")
else:
    print(f"❌ TWILIO_ACCOUNT_SID: MISSING or INVALID")
    all_good = False

if twilio_token and len(twilio_token) == 32:
    print(f"✅ TWILIO_AUTH_TOKEN: {'*' * 32} (32 chars)")
else:
    print(f"❌ TWILIO_AUTH_TOKEN: MISSING or INVALID LENGTH")
    all_good = False

if twilio_number and twilio_number.startswith('+1'):
    print(f"✅ TWILIO_CALLER_NUMBER: {twilio_number}")
else:
    print(f"❌ TWILIO_CALLER_NUMBER: MISSING or INVALID FORMAT")
    all_good = False

if base_url and (base_url.startswith('http://') or base_url.startswith('https://')):
    if 'ngrok' in base_url or 'localhost' in base_url:
        print(f"⚠️  BASE_URL: {base_url}")
        if 'abc123.ngrok.io' in base_url:
            print("    ⚠️  This is a placeholder! Update with real ngrok URL")
            all_good = False
        elif 'localhost' in base_url:
            print("    ⚠️  Localhost won't work! Use ngrok for webhooks")
            all_good = False
    else:
        print(f"✅ BASE_URL: {base_url}")
else:
    print(f"❌ BASE_URL: MISSING or INVALID")
    all_good = False

print("\n" + "=" * 60)
print("📞 EMERGENCY CONTACTS")
print("=" * 60)

contacts = {
    'Fire': os.getenv('EMERGENCY_FIRE'),
    'Ambulance': os.getenv('EMERGENCY_AMBULANCE'),
    'Police': os.getenv('EMERGENCY_POLICE'),
    'Manager': os.getenv('EMERGENCY_MANAGER')
}

for name, number in contacts.items():
    if number and number.startswith('+91') and len(number) == 13:
        print(f"✅ {name}: {number}")
    else:
        print(f"⚠️  {name}: {number} (verify E.164 format)")

print("\n" + "=" * 60)
print("📋 OTHER SETTINGS")
print("=" * 60)
print(f"CORS_ORIGINS: {os.getenv('CORS_ORIGINS', 'Not set')}")
print(f"MODEL_PATH: {os.getenv('MODEL_PATH', 'Not set')}")

print("\n" + "=" * 60)
if all_good:
    print("✅ ALL CRITICAL SETTINGS CONFIGURED CORRECTLY!")
    print("=" * 60)
    print("\n🚀 READY TO START!")
    print("   Run: python app.py")
    print("   Test: python test_emergency_calls.py")
else:
    print("⚠️  SOME ISSUES FOUND - FIX BEFORE TESTING")
    print("=" * 60)
    print("\n📝 NEXT STEPS:")
    print("1. Install ngrok: https://ngrok.com/download")
    print("2. Run in new terminal: ngrok http 8000")
    print("3. Copy the HTTPS URL (e.g., https://abc-xyz.ngrok.io)")
    print("4. Update BASE_URL in .env file with real ngrok URL")
    print("5. Verify phone numbers in Twilio Console:")
    print("   https://console.twilio.com/us1/develop/phone-numbers/manage/verified")
    print("6. Re-run this script: python validate_env.py")

print("=" * 60)
