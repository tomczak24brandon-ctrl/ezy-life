"""
Iron Eagle - Test eBay REST API OAuth token (modern approach)
"""
import sys, os, base64, requests
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app_id  = os.getenv("EBAY_APP_ID")
cert_id = os.getenv("EBAY_CERT_ID")

# Base64 encode App ID + Cert ID for OAuth
credentials = base64.b64encode(f"{app_id}:{cert_id}".encode()).decode()

url = "https://api.ebay.com/identity/v1/oauth2/token"
headers = {
    "Authorization": f"Basic {credentials}",
    "Content-Type": "application/x-www-form-urlencoded",
}
body = "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope"

print(f"Testing REST OAuth with App ID: {app_id}")
r = requests.post(url, headers=headers, data=body, timeout=15)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:600]}")
