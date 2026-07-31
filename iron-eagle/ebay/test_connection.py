"""
Iron Eagle eBay API - Connection Test
"""
import os
import sys

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app_id  = os.getenv("EBAY_APP_ID")
dev_id  = os.getenv("EBAY_DEV_ID")
cert_id = os.getenv("EBAY_CERT_ID")
token   = os.getenv("EBAY_USER_TOKEN")

print("Loaded credentials:")
print(f"  App ID : {app_id}")
print(f"  Dev ID : {dev_id}")
print(f"  Cert ID: {cert_id}")
print(f"  Token  : {token[:30]}..." if token else "  Token  : MISSING")
print()

try:
    from ebaysdk.trading import Connection as Trading

    api = Trading(
        appid=app_id,
        devid=dev_id,
        certid=cert_id,
        token=token,
        config_file=None
    )

    response = api.execute("GeteBayOfficialTime", {})
    data = response.dict()
    print("SUCCESS - eBay API connected!")
    print(f"Server time: {data.get('Timestamp', 'N/A')}")
    print(f"Ack: {data.get('Ack', 'N/A')}")

except Exception as e:
    print(f"FAILED: {e}")
    try:
        print("Raw response:", api.response.content)
    except Exception:
        pass
